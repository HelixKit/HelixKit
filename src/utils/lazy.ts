/**
 * Lazy loading utilities for Helix
 */

import type { Element } from '../core/types';
// Import h without a direct reference
import '../core/component';

/**
 * Type definition for a lazy component
 */
interface LazyComponent<T = any> {
  (props: any): Element;
  preload: () => Promise<T>;
}

/**
 * Creates a lazily-loaded component that will only be fetched when rendered
 */
export function lazy<T extends (...args: any[]) => Element>(
  factory: () => Promise<{ default: T }>
): LazyComponent {
  let Component: T | null = null;
  let loadPromise: Promise<T> | null = null;

  // Create a promise for loading the component
  const load = () => {
    if (!loadPromise) {
      loadPromise = factory()
        .then(module => {
          Component = module.default;
          return Component;
        })
        .catch(error => {
          console.error('Error loading lazy component:', error);
          throw error;
        });
    }
    return loadPromise;
  };

  // The actual component that will be rendered
  const LazyComponent = (props: any): Element => {
    // If component is already loaded, render it
    if (Component) {
      return Component(props);
    }

    // Start loading if not already started
    const promise = load();

    // Throw promise to trigger Suspense
    throw promise.then(() => {
      // Empty promise to trigger re-render
      return Promise.resolve();
    });
  };

  // Expose preload method
  LazyComponent.preload = load;

  return LazyComponent;
}

/**
 * Suspense component for handling async content
 */
export function Suspense({
  fallback,
  children,
}: {
  fallback: Element;
  children: Element;
}): Element {
  try {
    return children;
  } catch (error) {
    if (error instanceof Promise) {
      // Use an effect to re-render when the promise resolves
      error.then(() => {
        // This would trigger a re-render in the real implementation
      });
      return fallback;
    }
    throw error;
  }
}

/**
 * Utility for prefetching lazy components
 */
export function prefetch(components: LazyComponent[]): Promise<any[]> {
  return Promise.all(components.map(component => component.preload()));
}

/**
 * Throws a promise that will resolve when the condition is true
 * Useful for data loading in components
 */
export function suspend<T>(
  promise: Promise<T>,
  condition: (value: T | undefined) => boolean,
  initialValue?: T
): T {
  let value = initialValue;
  let status = 'pending';
  let error: any;

  const suspendPromise = promise.then(
    result => {
      status = 'success';
      value = result;
    },
    err => {
      status = 'error';
      error = err;
    }
  );

  if (status === 'pending' || !condition(value)) {
    throw suspendPromise;
  }

  if (status === 'error') {
    throw error;
  }

  return value as T;
}

/**
 * Error boundary component
 */
export function ErrorBoundary({
  fallback,
  children,
}: {
  fallback: (props: { error: Error; retry: () => void }) => Element;
  children: Element;
}): Element {
  try {
    return children;
  } catch (error) {
    // We don't want to catch Promise suspensions
    if (error instanceof Promise) {
      throw error;
    }

    // Handle regular errors
    const retry = () => {
      // Force a re-render to try again
    };

    return fallback({
      error: error instanceof Error ? error : new Error(String(error)),
      retry,
    });
  }
}
