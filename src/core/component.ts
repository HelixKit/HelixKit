/**
 * Component system for Helix
 * Functional component model with efficient rendering
 */

import type { Element } from './types';

/**
 * Creates an element (virtual DOM node)
 */
export function h(
  type: string | ((...args: any[]) => any),
  props: Record<string, any> = {},
  ...children: Array<any>
): Element {
  return {
    type,
    props: props || {},
    children: children
      .flat()
      .filter(
        child => child !== undefined && child !== null && child !== false
      ),
    key: props?.key,
  };
}

/**
 * JSX Factory
 */
export function jsx(
  type: string | ((...args: any[]) => any),
  props: Record<string, any>
): Element {
  const { children, ...rest } = props || {};
  const element = h(
    type,
    rest,
    ...(Array.isArray(children) ? children : [children])
  );
  return element;
}

/**
 * Fragment for JSX
 */
export function Fragment(props: { children: any }) {
  return props.children;
}

/**
 * Creates an error boundary
 */
export function createErrorBoundary(FallbackComponent: (props: any) => Element) {
  return function withErrorBoundary(Component: (props: any) => Element) {
    return function ErrorBoundary(props: any) {
      try {
        return h(Component, props);
      } catch (error) {
        return h(FallbackComponent, {
          error,
          reset: () => h(ErrorBoundary, props),
        });
      }
    };
  };
}
