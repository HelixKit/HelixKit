/**
 * Reactivity system for Helix
 * Inspired by SolidJS and Svelte, optimized for performance
 */

// Type definitions
type SignalValue<T> = {
  value: T;
  subscribers: Set<() => void>;
};

// Current effect tracking
let currentEffect: (() => void) | null = null;

/**
 * Creates a reactive signal with getter and setter
 */
export function createSignal<T>(
  initialValue: T
): [() => T, (newValue: T | ((prev: T) => T)) => void] {
  const signal: SignalValue<T> = {
    value: initialValue,
    subscribers: new Set(),
  };

  // Reader function
  const read = () => {
    // Track signal access in reactive context
    if (currentEffect) {
      signal.subscribers.add(currentEffect);
    }
    return signal.value;
  };

  // Writer function
  const write = (newValue: T | ((prev: T) => T)) => {
    const resolvedValue =
      typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(signal.value)
        : newValue;

    // Only update if value changed
    if (signal.value !== resolvedValue) {
      signal.value = resolvedValue;

      // Import scheduler locally to avoid circular dependencies
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { scheduleTask, Priority } = require('./scheduler');

      // Schedule updates with normal priority
      scheduleTask(() => {
        // Create a copy to avoid issues with subscribers adding other subscribers
        const subscribers = Array.from(signal.subscribers);
        for (const subscriber of subscribers) {
          subscriber();
        }
      }, Priority.NORMAL);
    }
  };

  return [read, write];
}

/**
 * Creates an effect that runs when dependencies change
 */
export function createEffect(fn: () => void): () => void {
  const effect = () => {
    // Clear previous subscriptions
    currentEffect = effect;
    try {
      fn();
    } finally {
      currentEffect = null;
    }
  };

  // Run immediately
  effect();

  // Return cleanup function
  return effect;
}

/**
 * Creates a memoized value that updates when dependencies change
 */
export function createMemo<T>(fn: () => T): () => T {
  const [value, setValue] = createSignal<T>(fn());

  createEffect(() => {
    setValue(fn());
  });

  return value;
}

/**
 * Creates a reactive resource for data fetching
 */
export function createResource<T, K>(
  source: () => K,
  fetcher: (source: K) => Promise<T>
): [
  () => T | undefined,
  { loading: () => boolean; error: () => Error | null },
] {
  const [data, setData] = createSignal<T | undefined>(undefined);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<Error | null>(null);

  createEffect(() => {
    const key = source();
    setLoading(true);
    setError(null);

    fetcher(key)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
  });

  return [data, { loading, error }];
}

/**
 * Creates a context for dependency injection
 */
export function createContext<T>(defaultValue: T) {
  const Context = {
    Provider: ({ _value, children }: { _value: T; children: any }) => {
      // Context provider implementation would go here
      return children;
    },
    use: (): T => {
      // Context consumer implementation would go here
      return defaultValue;
    },
  };

  return Context;
}
