/**
 * Data fetching resources for Helix
 * Provides an elegant way to handle async data and loading states
 */

import { createSignal, createEffect } from './reactivity';

/**
 * Creates a resource for asynchronous data fetching
 *
 * @param source A function that returns the source for the fetcher
 * @param fetcher A function that takes the source and returns a promise
 * @returns A tuple with the resource value and metadata
 */
export function createResource<T, S>(
  source: () => S,
  fetcher: (source: S) => Promise<T>
): [
  () => T | undefined,
  {
    loading: () => boolean;
    error: () => Error | null;
    refetch: () => Promise<void>;
  },
] {
  // Resource state
  const [data, setData] = createSignal<T | undefined>(undefined);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<Error | null>(null);

  // Fetch data function
  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(source());
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Resource fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  createEffect(() => {
    const _ = source(); // Track the source
    fetchData();
  });

  // Return resource
  return [
    data,
    {
      loading,
      error,
      refetch: fetchData,
    },
  ];
}

/**
 * Creates a paginated resource for handling large datasets
 */
export function createPaginatedResource<T, S>(
  source: () => S,
  fetcher: (source: S, page: number) => Promise<T[]>,
  options = { pageSize: 10, initialPage: 1 }
): {
  data: () => T[];
  loading: () => boolean;
  error: () => Error | null;
  page: () => number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  refetch: () => Promise<void>;
} {
  // State
  const [data, setData] = createSignal<T[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<Error | null>(null);
  const [page, setPage] = createSignal(options.initialPage);
  const [hasMore, setHasMore] = createSignal(true);

  // Fetch data function
  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = page();
      const result = await fetcher(source(), currentPage);

      setData(result);
      setHasMore(result.length === options.pageSize);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Paginated resource fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  createEffect(() => {
    const sourceVal = source(); // Track the source
    const pageVal = page(); // Track the page
    fetchData();
  });

  // Navigation functions
  const nextPage = () => {
    if (hasMore()) {
      setPage(p => p + 1);
    }
  };

  const prevPage = () => {
    if (page() > 1) {
      setPage(p => p - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  };

  // Return resource
  return {
    data,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    goToPage,
    hasNext: hasMore,
    hasPrev: () => page() > 1,
    refetch: fetchData,
  };
}

/**
 * Creates a resource pool for managing multiple resources
 */
export function createResourcePool<T, S>(
  sourceFactory: (key: string) => () => S,
  fetcherFactory: (key: string) => (source: S) => Promise<T>
): {
  get: (
    key: string
  ) => [
    () => T | undefined,
    { loading: () => boolean; error: () => Error | null },
  ];
  prefetch: (key: string) => Promise<void>;
  clear: (key?: string) => void;
} {
  // Resource cache
  const resources: Record<string, ReturnType<typeof createResource>> = {};

  // Get or create resource
  const get = (key: string) => {
    if (!resources[key]) {
      const source = sourceFactory(key);
      const fetcher = fetcherFactory(key);
      resources[key] = createResource(source, fetcher);
    }

    return resources[key];
  };

  // Prefetch resource
  const prefetch = async (key: string): Promise<void> => {
    const [_, { refetch }] = get(key);
    await refetch();
  };

  // Clear resources
  const clear = (key?: string) => {
    if (key) {
      delete resources[key];
    } else {
      Object.keys(resources).forEach(k => delete resources[k]);
    }
  };

  // Define proper return type
  type ResourceFactoryResult<T> = {
    get: (key: string) => [
      () => T | undefined, 
      { 
        loading: () => boolean; 
        error: () => Error | null; 
        refetch: () => Promise<void>;
      }
    ],
    prefetch: (key: string) => Promise<void>,
    clear: (key?: string) => void
  };

  return {
    get,
    prefetch,
    clear,
  } as ResourceFactoryResult<T>;
}

/**
 * Creates a suspense resource that can be used with suspense boundaries
 */
export function createSuspenseResource<T, S>(
  source: () => S,
  fetcher: (source: S) => Promise<T>
): () => T {
  let status = 'pending';
  let result: T;
  let error: Error;
  let promise: Promise<void>;

  // Fetch on creation
  const fetchData = () => {
    status = 'pending';
    promise = fetcher(source())
      .then(data => {
        status = 'success';
        result = data;
      })
      .catch(err => {
        status = 'error';
        error = err instanceof Error ? err : new Error(String(err));
      });
  };

  fetchData();

  // Effect to refetch when source changes
  createEffect(() => {
    const _ = source(); // Track the source
    fetchData();
  });

  // Return suspense-enabled resource
  return () => {
    if (status === 'pending') {
      throw promise;
    } else if (status === 'error') {
      throw error;
    } else {
      return result;
    }
  };
}

/**
 * Creates a resource with request deduplication and caching
 */
export function createCachedResource<T, S>(
  source: () => S,
  fetcher: (source: S) => Promise<T>,
  options = { cacheTTL: 60000 } // 1 minute by default
): [
  () => T | undefined,
  { loading: () => boolean; error: () => Error | null; invalidate: () => void },
] {
  // Cache storage
  const cache = new Map<string, { data: T; timestamp: number }>();

  // In-flight requests
  const requests = new Map<string, Promise<T>>();

  // Custom fetcher with caching
  const cachedFetcher = async (src: S): Promise<T> => {
    const key = JSON.stringify(src);

    // Check cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < options.cacheTTL) {
      return cached.data;
    }

    // Check if request is in-flight
    if (requests.has(key)) {
      return requests.get(key)!;
    }

    // Make new request
    const promise = fetcher(src);
    requests.set(key, promise);

    try {
      const data = await promise;
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    } finally {
      requests.delete(key);
    }
  };

  // Create base resource
  const [data, { loading, error, refetch }] = createResource(
    source,
    cachedFetcher
  );

  // Add invalidate method
  const invalidate = () => {
    const key = JSON.stringify(source());
    cache.delete(key);
    refetch();
  };

  return [data, { loading, error, invalidate }];
}
