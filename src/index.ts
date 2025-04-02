/**
 * Main entry point for Helix framework
 */

// Core functionality
export {
  // Reactivity
  createSignal,
  createEffect,
  createMemo,
  createResource,
  createContext,

  // Components
  h,

  // Rendering
  render,
  renderToString,

  // Lifecycle
  onMount,
  onUnmount,

  // Routing
  createRouter,

  // State management
  createStore,

  // Scheduling
  scheduleTask,
  Priority,
  afterLayout,
  afterPaint,
  scheduleIdle,
} from './core';

// SSR functionality
export {
  renderToHTML,
  createStreamingRenderer,
  createProgressiveRenderer,
  createSuspenseBoundary,
} from './ssr';

// Utilities
export {
  uniqueId,
  debounce,
  throttle,
  memoize,
  createErrorBoundary,

  // Testing
  renderForTest,
  mockComponent,
  act,

  // Lazy loading
  lazy,
  Suspense,
  ErrorBoundary,
  prefetch,
  suspend,
} from './utils';

// Export the JSX runtime for TypeScript
export { jsx, jsxs, Fragment } from './utils/jsx';

// JSX namespace
export type { JSX } from './utils/jsx';

// Export component types
export type { Component, Element } from './core/types';

// Version info
export const version = '0.1.0';

// Convenience aliases
import { h } from './core/component';
export const h$ = h;
export const html = h;
