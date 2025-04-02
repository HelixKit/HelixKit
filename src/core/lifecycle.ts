/**
 * Lifecycle hooks for Helix components
 */

import { createEffect } from './reactivity';

// Effect tracking state
const currentEffect: (() => void) | null = null;

/**
 * Runs a callback when component mounts
 */
export function onMount(callback: () => void | (() => void)): void {
  if (!currentEffect) return;

  // Run after DOM is updated
  queueMicrotask(() => {
    const cleanup = callback();

    if (typeof cleanup === 'function') {
      // Store cleanup function
      if (currentEffect && getComponentContext(currentEffect)) {
        const context = getComponentContext(currentEffect);
        if (context) {
          context.cleanups.push(cleanup);
        }
      }
    }
  });
}

/**
 * Runs a callback when component unmounts
 */
export function onUnmount(callback: () => void): void {
  if (!currentEffect) return;

  const context = getComponentContext(currentEffect);
  if (context) {
    context.cleanups.push(callback);
  }
}

/**
 * Gets the component context for an effect
 * (Simplified implementation for demo)
 */
function getComponentContext(
  _effect: () => void
): { cleanups: (() => void)[] } | null {
  // In a real implementation, we would track the relationship
  // between effects and component instances
  return {
    cleanups: [],
  };
}

/**
 * Creates a deferred value that updates after render
 */
export function createDeferred<T>(source: () => T, timeoutMs = 0): () => T {
  let value = source();
  let timeout: any;

  createEffect(() => {
    const newValue = source();

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      value = newValue;
    }, timeoutMs);
  });

  return () => value;
}
