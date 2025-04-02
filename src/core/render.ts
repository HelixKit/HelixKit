/**
 * DOM Rendering for Helix
 * Efficient DOM operations with minimal updates
 */

import type { Element } from './types';

// Import diffing algorithm
import { diff } from './diff';

/**
 * Renders an element to a DOM container
 */
export function render(element: Element, container: HTMLElement): () => void {
  // Store current rendered element for future diffs
  const renderRoot: any = container._helixRoot || {
    element: null,
    mount: null,
  };

  if (!renderRoot.element) {
    // First render
    container.innerHTML = '';

    // Mount element
    const mounted = mount(element, container);

    // Store for future updates
    renderRoot.element = element;
    renderRoot.mount = mounted;
    (container as any)._helixRoot = renderRoot;
  } else {
    // Update existing tree using diff algorithm
    const firstChild = container.firstChild;
    if (firstChild) {
      diff(renderRoot.element, element, firstChild);
    } else {
      // Mount from scratch if no child exists
      const mounted = mount(element, container);
      renderRoot.mount = mounted;
    }

    // Update stored element reference
    renderRoot.element = element;
  }

  // Return cleanup function
  return () => {
    if (renderRoot.mount) {
      unmount(renderRoot.mount);
      renderRoot.element = null;
      renderRoot.mount = null;
    }
  };
}

/**
 * Mounts an element to the DOM
 */
function mount(
  element: Element,
  container: HTMLElement | null,
  isSVG = false
): any {
  if (typeof element.type === 'function') {
    // Handle functional component
    const Component = element.type;
    const renderedElement = Component(element.props);
    const mounted = mount(renderedElement, container, isSVG);

    return {
      element,
      node: mounted.node,
      cleanup: mounted.cleanup,
      children: [mounted],
    };
  } else if (typeof element.type === 'string') {
    // Handle DOM element
    const isNS = isSVG || element.type === 'svg';
    const node = isNS
      ? document.createElementNS('http://www.w3.org/2000/svg', element.type)
      : document.createElement(element.type);

    // Apply props
    for (const [key, value] of Object.entries(element.props)) {
      if (key === 'ref' && typeof value === 'function') {
        value(node);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(node.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        node.addEventListener(eventName, value);
      } else if (key !== 'children' && key !== 'key') {
        // Handle attributes
        if (typeof value === 'boolean' && value) {
          node.setAttribute(key, '');
        } else if (value != null && value !== false) {
          node.setAttribute(key, String(value));
        }
      }
    }

    // Mount children
    const childComponents: Array<any> = [];
    const cleanupFunctions: Array<() => void> = [];

    for (const child of element.children) {
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'boolean'
      ) {
        const textNode = document.createTextNode(String(child));
        node.appendChild(textNode);
      } else if (child) {
        const mounted = mount(child, node as HTMLElement, isNS);
        childComponents.push(mounted);
      }
    }

    if (container) {
      container.appendChild(node);
    }

    return {
      element,
      node,
      cleanup: cleanupFunctions,
      children: childComponents,
    };
  } else {
    // Fragment-like behavior for null component types
    const node = document.createTextNode('');
    if (container) {
      container.appendChild(node);
    }

    return {
      element,
      node,
      cleanup: [],
      children: [],
    };
  }
}

/**
 * Unmounts a component from the DOM
 */
function unmount(mounted: any): void {
  // Run cleanup functions
  for (const cleanup of mounted.cleanup) {
    cleanup();
  }

  // Unmount children
  for (const child of mounted.children) {
    unmount(child);
  }

  // Remove from DOM
  if (mounted.node.parentNode) {
    mounted.node.parentNode.removeChild(mounted.node);
  }

  // Call ref with null if defined
  if (typeof mounted.element.ref === 'function') {
    mounted.element.ref(null);
  }
}

/**
 * Server-side rendering
 */
export function renderToString(element: Element): string {
  if (typeof element.type === 'function') {
    const Component = element.type;
    const rendered = Component(element.props);
    return renderToString(rendered);
  }

  if (typeof element.type === 'string') {
    let html = `<${element.type}`;

    // Add attributes
    for (const [key, value] of Object.entries(element.props)) {
      if (key !== 'children' && key !== 'ref' && key !== 'key') {
        if (typeof value === 'boolean' && value) {
          html += ` ${key}`;
        } else if (value != null && value !== false) {
          html += ` ${key}="${String(value).replace(/"/g, '&quot;')}"`;
        }
      }
    }

    // Self-closing tags
    const voidElements = new Set([
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ]);

    if (voidElements.has(element.type) && element.children.length === 0) {
      return `${html} />`;
    }

    html += '>';

    // Add children
    for (const child of element.children) {
      if (child == null) continue;

      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'boolean'
      ) {
        html += String(child);
      } else {
        html += renderToString(child);
      }
    }

    // Closing tag
    html += `</${element.type}>`;
    return html;
  }

  // Fragment-like behavior
  return element.children
    .map(child => {
      if (child == null) return '';
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'boolean'
      ) {
        return String(child);
      }
      return renderToString(child);
    })
    .join('');
}
