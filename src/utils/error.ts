/**
 * Error handling utilities for Helix
 */

/**
 * Custom error class for Helix
 */
export class HelixError extends Error {
  code: string;

  constructor(message: string, code: string = 'HELIX_ERROR') {
    super(message);
    this.name = 'HelixError';
    this.code = code;
  }
}

/**
 * Component error for error boundaries
 */
export class ComponentError extends HelixError {
  componentName: string;

  constructor(message: string, componentName: string) {
    super(message, 'COMPONENT_ERROR');
    this.componentName = componentName;
  }
}

/**
 * Router error
 */
export class RouterError extends HelixError {
  path: string;

  constructor(message: string, path: string) {
    super(message, 'ROUTER_ERROR');
    this.path = path;
  }
}

/**
 * Resource fetch error
 */
export class ResourceError extends HelixError {
  source: any;
  response?: Response;

  constructor(message: string, source: any, response?: Response) {
    super(message, 'RESOURCE_ERROR');
    this.source = source;
    this.response = response;
  }
}

/**
 * Creates an error boundary component
 */
export function createErrorBoundary(FallbackComponent: (props: any) => any) {
  return function withErrorBoundary(Component: (props: any) => any) {
    return function ErrorBoundary(props: any) {
      try {
        return Component(props);
      } catch (error) {
        console.error('Error in component:', error);

        return FallbackComponent({
          error,
          reset: () => {
            // Reset component
            try {
              return Component(props);
            } catch (resetError) {
              console.error('Error in component after reset:', resetError);
              return FallbackComponent({ error: resetError });
            }
          },
        });
      }
    };
  };
}

/**
 * Global error handler for Helix
 */
export function setupGlobalErrorHandler(): () => void {
  const originalOnError = window.onerror;

  // Handle uncaught errors
  window.onerror = function (message, source, lineno, colno, error) {
    console.error('Uncaught error:', { message, source, lineno, colno, error });

    // Call original handler if exists
    if (typeof originalOnError === 'function') {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }

    // Prevent default
    return true;
  };

  // Handle unhandled promises
  const originalOnUnhandledRejection = window.onunhandledrejection;

  window.onunhandledrejection = function (event) {
    console.error('Unhandled promise rejection:', event.reason);

    // Call original handler if exists
    if (typeof originalOnUnhandledRejection === 'function') {
      return (originalOnUnhandledRejection as (this: WindowEventHandlers, ev: PromiseRejectionEvent) => any).call(window, event);
    }
  };

  // Return cleanup function
  return () => {
    window.onerror = originalOnError;
    window.onunhandledrejection = originalOnUnhandledRejection;
  };
}
