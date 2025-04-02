/**
 * SSR module exports for Helix
 */

export * from './hydrate';
export * from './server';

// Import specific functions to avoid naming conflicts
import { renderToHTML } from './render';
import { createProgressiveRenderer } from './render';

// Import from streaming with explicit naming
import { 
  createStreamingRenderer as createStreaming
} from './streaming';

// Re-export with unique names
export { 
  renderToHTML,
  createProgressiveRenderer,
  createStreaming as createStreamingRenderer
};

/**
 * Creates a suspense boundary for SSR
 * This allows async data to be fetched during SSR
 */
export function createSuspenseBoundary<T>(promise: Promise<T>): T {
  let status = 'pending';
  let result: T;
  let error: any;

  const suspender = promise.then(
    value => {
      status = 'success';
      result = value;
    },
    err => {
      status = 'error';
      error = err;
    }
  );

  if (status === 'pending') {
    throw suspender;
  } else if (status === 'error') {
    throw error;
  } else {
    return result!;
  }
}
