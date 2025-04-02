/**
 * Testing utilities for Helix applications
 */

import { render } from '../core/render';
import type { Element } from '../core/types';

/**
 * Test renderer for components
 * Creates a detached DOM element for testing
 */
export function renderForTest(element: Element) {
  // Create detached container
  const container = document.createElement('div');

  // Render component
  const cleanup = render(element, container);

  // Return test utilities
  return {
    container,
    cleanup,

    // Get element by selector
    querySelector: (selector: string) => container.querySelector(selector),

    // Get all elements by selector
    querySelectorAll: (selector: string) =>
      container.querySelectorAll(selector),

    // Get text content
    getTextContent: () => container.textContent,

    // Simulate event
    fireEvent: (element: HTMLElement | null, eventName: string, eventData = {}) => {
      if (!element) return;
      const event = new Event(eventName, { bubbles: true });
      Object.assign(event, eventData);
      element.dispatchEvent(event);
    },
  };
}

/**
 * Creates a mock for a component
 */
export function mockComponent(
  Component: (...args: any[]) => any,
  mockImplementation: (...args: any[]) => any
) {
  const originalComponent = Component;
  const mock = (...args: any[]) => mockImplementation(...args);

  // Restore original implementation
  mock.restore = () => {
    return originalComponent;
  };

  return mock;
}

/**
 * Wait for component updates to process
 */
export async function act(callback: () => void | Promise<void>) {
  const result = callback();
  if (result instanceof Promise) {
    await result;
  }
  // Wait for microtasks to process
  await new Promise(resolve => setTimeout(resolve, 0));
}
