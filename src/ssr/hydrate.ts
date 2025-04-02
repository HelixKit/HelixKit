/**
 * Client-side hydration for Helix apps
 */

import { h, render } from '../core';
import type { Element } from '../core/types';

/**
 * Hydrates a server-rendered app
 */
export function hydrate(
  AppComponent: () => Element,
  container: HTMLElement = document.getElementById('app')!
): void {
  if (!container) {
    console.error('Container not found for hydration');
    return;
  }

  // Check if we should hydrate
  const shouldHydrate =
    typeof window !== 'undefined' && window.__HELIX_HYDRATE__ === true;

  if (!shouldHydrate) {
    // If not hydrating, just render normally
    render(h(AppComponent, {}), container);
    return;
  }

  // Get server data if available
  const serverData =
    (typeof window !== 'undefined' && window.__HELIX_DATA__) || {};

  // Preserve existing DOM
  const _existingHTML = container.innerHTML;

  // Render with server data
  const app = h(AppComponent, { serverData });

  // Hydrate the app
  hydrateElement(app, container);

  console.log('Helix app hydrated successfully');
}

/**
 * Hydrates an element to a container
 */
function hydrateElement(element: Element, container: HTMLElement): void {
  // Create a new rendering that will preserve the existing DOM
  // where possible and only update what's needed

  // In a real implementation, this would:
  // 1. Walk the virtual DOM tree
  // 2. Match with existing DOM nodes
  // 3. Only create/update nodes that differ
  // 4. Attach event listeners

  // For this example, we'll use a simplified approach
  // that just renders over the existing DOM
  render(element, container);
}

/**
 * Custom element for deferred hydration
 */
if (typeof customElements !== 'undefined') {
  class HelixIsland extends HTMLElement {
    connectedCallback() {
      // Get component path and props
      const componentPath = this.getAttribute('component');
      const propsAttr = this.getAttribute('props');
      const props = propsAttr ? JSON.parse(propsAttr) : {};

      if (!componentPath) return;

      // Load component
      import(componentPath)
        .then(module => {
          const Component = module.default;
          if (!Component) return;

          // Render component
          render(h(Component, props), this);
        })
        .catch(err => {
          console.error('Failed to hydrate island:', err);
        });
    }
  }

  customElements.define('helix-island', HelixIsland);
}
