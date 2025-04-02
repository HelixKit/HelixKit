/**
 * Virtual DOM diffing algorithm for Helix
 * Optimizes DOM updates by only modifying what changed
 */

import type { Element } from './types';
import { afterLayout } from './scheduler';

/**
 * Compares two elements and updates the DOM efficiently
 */
export function diff(
  oldElement: Element | null,
  newElement: Element | null,
  dom: Node,
  parentComponent: any = null
): Node | null {
  // Both elements are null/undefined
  if (!oldElement && !newElement) {
    return null;
  }

  // New element doesn't exist (remove)
  if (oldElement && !newElement) {
    const node = dom;
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    return null;
  }

  // Old element doesn't exist (create)
  if (!oldElement && newElement) {
    const newNode = createDOMNode(newElement, parentComponent);
    if (dom.parentNode) {
      dom.parentNode.insertBefore(newNode, dom);
      dom.parentNode.removeChild(dom);
    }
    return newNode;
  }

  // Different element types
  if (
    typeof oldElement!.type !== typeof newElement!.type ||
    (typeof oldElement!.type === 'string' &&
      oldElement!.type !== newElement!.type)
  ) {
    const newNode = createDOMNode(newElement!, parentComponent);
    if (dom.parentNode) {
      dom.parentNode.replaceChild(newNode, dom);
    }
    return newNode;
  }

  // Handle component updates
  if (typeof newElement!.type === 'function') {
    // Component type - handle functional components
    const Component = newElement!.type;
    const oldRendered = oldElement!.rendered;
    const newRendered = Component(newElement!.props);

    // Save rendered element for future diffs
    newElement!.rendered = newRendered;

    // Recursively diff the rendered content
    return diff(oldRendered || null, newRendered, dom, newElement);
  }

  // Update regular DOM element
  if (typeof newElement!.type === 'string') {
    // Update props
    updateDOMProps(dom as HTMLElement, oldElement!.props, newElement!.props);

    // Update children
    const oldChildren = oldElement!.children;
    const newChildren = newElement!.children;
    updateChildren(dom, oldChildren, newChildren, parentComponent);

    return dom;
  }

  return dom;
}

/**
 * Creates a DOM node from a virtual element
 */
function createDOMNode(element: Element, parentComponent: any = null): Node {
  if (typeof element.type === 'function') {
    // Component type
    const Component = element.type;
    const rendered = Component(element.props);

    // Save rendered element for future diffs
    element.rendered = rendered;

    // Recursively create DOM node
    return createDOMNode(rendered, element);
  }

  if (typeof element.type === 'string') {
    // Create DOM element
    const isNS = element.type === 'svg';
    const node = isNS
      ? document.createElementNS('http://www.w3.org/2000/svg', element.type)
      : document.createElement(element.type);

    // Set props
    updateDOMProps(node, {}, element.props);

    // Create and append children
    for (const child of element.children) {
      if (child == null) continue;

      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'boolean'
      ) {
        node.appendChild(document.createTextNode(String(child)));
      } else {
        node.appendChild(createDOMNode(child, parentComponent));
      }
    }

    return node;
  }

  // Text nodes and fragments
  return document.createTextNode(String(element));
}

/**
 * Updates DOM element props
 */
function updateDOMProps(
  node: HTMLElement | SVGElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
): void {
  const allProps = new Set([
    ...Object.keys(oldProps),
    ...Object.keys(newProps),
  ]);

  for (const name of allProps) {
    // Skip special props
    if (name === 'children' || name === 'key' || name === 'ref') {
      continue;
    }

    const oldValue = oldProps[name];
    const newValue = newProps[name];

    // Remove props that don't exist in new props
    if (newValue == null || newValue === false) {
      if (name.startsWith('on')) {
        const eventName = name.slice(2).toLowerCase();
        node.removeEventListener(eventName, oldValue);
      } else {
        node.removeAttribute(name);
      }
      continue;
    }

    // Handle different prop types
    if (name === 'style' && typeof newValue === 'object') {
      // Style objects
      const styleObj = newValue as CSSStyleDeclaration;
      for (const key in styleObj) {
        (node.style as any)[key] = styleObj[key];
      }
    } else if (name.startsWith('on') && typeof newValue === 'function') {
      // Event listeners
      const eventName = name.slice(2).toLowerCase();
      if (oldValue) {
        node.removeEventListener(eventName, oldValue);
      }
      node.addEventListener(eventName, newValue);
    } else if (typeof newValue === 'boolean' && newValue) {
      // Boolean attributes
      node.setAttribute(name, '');
    } else {
      // Regular attributes
      node.setAttribute(name, String(newValue));
    }
  }

  // Handle ref prop
  if (newProps.ref && typeof newProps.ref === 'function') {
    // Schedule ref updates after layout
    afterLayout(() => {
      newProps.ref(node);
    });
  }
}

/**
 * Efficient child list reconciliation
 */
function updateChildren(
  parentNode: Node,
  oldChildren: any[],
  newChildren: any[],
  parentComponent: any
): void {
  // Optimize for common cases
  if (oldChildren.length === 0) {
    // Only appending
    for (const child of newChildren) {
      if (child == null) continue;

      const childNode =
        typeof child === 'object'
          ? createDOMNode(child, parentComponent)
          : document.createTextNode(String(child));

      parentNode.appendChild(childNode);
    }
    return;
  }

  if (newChildren.length === 0) {
    // Only removing
    parentNode.textContent = '';
    return;
  }

  // Convert text nodes to elements for consistent handling
  const normalizedOldChildren = oldChildren.map(child =>
    typeof child === 'object'
      ? child
      : { type: '#text', props: {}, children: [], value: String(child) }
  );

  const normalizedNewChildren = newChildren.map(child =>
    typeof child === 'object'
      ? child
      : { type: '#text', props: {}, children: [], value: String(child) }
  );

  // Key-based reconciliation
  const oldKeyMap = new Map();
  normalizedOldChildren.forEach((child, i) => {
    const key = child.key != null ? String(child.key) : `index:${i}`;
    oldKeyMap.set(key, {
      element: child,
      index: i,
      node: parentNode.childNodes[i],
    });
  });

  // Keep track of processed old nodes
  const processed = new Set();

  // Resulting array of child nodes
  const newChildNodes: Node[] = [];

  // First pass: handle updates and moves
  for (let i = 0; i < normalizedNewChildren.length; i++) {
    const newChild = normalizedNewChildren[i];
    const key = newChild.key != null ? String(newChild.key) : `index:${i}`;
    const oldChildInfo = oldKeyMap.get(key);

    let newChildNode: Node | null = null;

    if (oldChildInfo) {
      // Update existing node
      processed.add(key);
      newChildNode = diff(
        oldChildInfo.element,
        newChild,
        oldChildInfo.node,
        parentComponent
      );
    } else {
      // Create new node
      newChildNode = createDOMNode(newChild, parentComponent);
    }

    if (newChildNode) {
      newChildNodes.push(newChildNode);
    }
  }

  // Second pass: remove unused old nodes
  for (const [key, info] of oldKeyMap.entries()) {
    if (!processed.has(key) && info.node.parentNode === parentNode) {
      parentNode.removeChild(info.node);
    }
  }

  // Final pass: ensure correct order
  for (let i = 0; i < newChildNodes.length; i++) {
    const childNode = newChildNodes[i];
    const currentChild = parentNode.childNodes[i];

    if (childNode !== currentChild) {
      // Insert at correct position
      if (currentChild) {
        parentNode.insertBefore(childNode, currentChild);
      } else {
        parentNode.appendChild(childNode);
      }
    }
  }
}
