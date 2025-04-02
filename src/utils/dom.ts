/**
 * DOM utilities for Helix
 */

/**
 * Creates a DOM element with attributes and children
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, any> = {},
  ...children: Array<Node | string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  // Set attributes
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'style' && typeof value === 'object') {
      // Handle style object
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Handle event listeners
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      // Handle other attributes
      element.setAttribute(key, String(value));
    }
  }

  // Append children
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Creates a debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: unknown, ...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Creates a throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function(this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Adds event listener with automatic cleanup
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type, listener, options);

  // Return cleanup function
  return () => {
    element.removeEventListener(type, listener, options);
  };
}

/**
 * Checks if an element is visible in viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Creates an intersection observer with callback
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, options);
}
