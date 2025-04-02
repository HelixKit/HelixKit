/**
 * Streaming SSR for Helix
 */

import { renderToString } from '../core/render';
import type { Element } from '../core/types';

/**
 * Options for streaming rendering
 */
interface StreamingOptions {
  template?: string;
  docType?: string;
  head?: string | (() => string);
  scripts?: string[];
  styles?: string[];
  onChunk?: (chunk: string) => void;
}

/**
 * Creates a streaming SSR renderer
 */
export function createStreamingRenderer(
  element: Element,
  options: StreamingOptions = {}
): ReadableStream {
  const {
    template = defaultTemplate,
    docType = '<!DOCTYPE html>',
    head = '',
    scripts = [],
    styles = [],
  } = options;

  const encoder = new TextEncoder();

  // Split template into parts
  const [beforeApp, afterApp] = splitTemplate(template);

  // Process head content
  const headContent = typeof head === 'function' ? head() : head;

  // Add styles
  const stylesHTML = styles
    .map(href => `<link rel="stylesheet" href="${href}">`)
    .join('\n  ');

  // Add scripts
  const scriptsHTML = scripts
    .map(src => `<script src="${src}"></script>`)
    .join('\n  ');

  // Process template parts
  let processedBeforeApp = beforeApp.replace(
    '<!--HEAD-->',
    `${headContent}\n  ${stylesHTML}`
  );

  const processedAfterApp = afterApp.replace('<!--SCRIPTS-->', scriptsHTML);

  // Ensure doctype
  if (!processedBeforeApp.startsWith('<!DOCTYPE')) {
    processedBeforeApp = `${docType}\n${processedBeforeApp}`;
  }

  return new ReadableStream({
    start(controller) {
      // Send the beginning of the template
      controller.enqueue(encoder.encode(processedBeforeApp));

      // Render the app
      const appHTML = renderToString(element);
      controller.enqueue(encoder.encode(appHTML));

      // Send the end of the template
      controller.enqueue(encoder.encode(processedAfterApp));

      controller.close();
    },
  });
}

/**
 * Creates a progressive streaming renderer with suspense support
 */
export function createProgressiveRenderer(
  element: Element,
  options: StreamingOptions = {}
): ReadableStream {
  const {
    template = defaultTemplate,
    docType = '<!DOCTYPE html>',
    head = '',
    scripts = [],
    styles = [],
    onChunk,
  } = options;

  const encoder = new TextEncoder();

  // Split template into parts
  const [beforeApp, afterApp] = splitTemplate(template);

  // Process head content
  const headContent = typeof head === 'function' ? head() : head;

  // Add styles
  const stylesHTML = styles
    .map(href => `<link rel="stylesheet" href="${href}">`)
    .join('\n  ');

  // Add scripts
  const scriptsHTML = scripts
    .map(src => `<script src="${src}"></script>`)
    .join('\n  ');

  // Process template parts
  let processedBeforeApp = beforeApp.replace(
    '<!--HEAD-->',
    `${headContent}\n  ${stylesHTML}`
  );

  const processedAfterApp = afterApp.replace('<!--SCRIPTS-->', scriptsHTML);

  // Ensure doctype
  if (!processedBeforeApp.startsWith('<!DOCTYPE')) {
    processedBeforeApp = `${docType}\n${processedBeforeApp}`;
  }

  // Create a new ReadableStream
  return new ReadableStream({
    start(controller) {
      // Send the beginning of the template
      const beforeChunk = processedBeforeApp;
      controller.enqueue(encoder.encode(beforeChunk));
      if (onChunk) onChunk(beforeChunk);

      // Implement progressive rendering with suspense boundaries
      renderProgressively(element, chunk => {
        controller.enqueue(encoder.encode(chunk));
        if (onChunk) onChunk(chunk);
      }).then(() => {
        // Send the end of the template
        const afterChunk = processedAfterApp;
        controller.enqueue(encoder.encode(afterChunk));
        if (onChunk) onChunk(afterChunk);

        controller.close();
      });
    },
  });
}

/**
 * Renders progressively with suspense support
 */
async function renderProgressively(
  element: Element,
  onChunk: (chunk: string) => void
): Promise<void> {
  // Map of placeholder IDs to their async content promises
  const suspenseBoundaries: Map<
    string,
    {
      promise: Promise<any>;
      element: Element;
    }
  > = new Map();

  // Initial render - this will capture suspense boundaries
  const { html, boundaries } = renderWithSuspense(element);

  // Send initial HTML with placeholders
  onChunk(html);

  // Add all found boundaries to our map
  for (const boundary of boundaries) {
    suspenseBoundaries.set(boundary.id, boundary);
  }

  // Wait for all suspense boundaries to resolve
  while (suspenseBoundaries.size > 0) {
    // Create a promise for each pending boundary
    const pendingPromises = Array.from(suspenseBoundaries.entries()).map(
      async ([id, { promise, element }]) => {
        try {
          // Wait for the data to be ready
          await promise;

          // Re-render this component now that data is available
          const renderedContent = renderToString(element);

          // Send the HTML that should replace the placeholder
          onChunk(
            `<script>
              document.getElementById("H:${id}").outerHTML = ${JSON.stringify(renderedContent)};
            </script>`
          );

          // Remove from pending map
          suspenseBoundaries.delete(id);
        } catch (error) {
          // Handle error case - replace with error UI
          const errorHTML = `
            <div style="color: red; padding: 1rem; border: 1px solid red; margin: 1rem 0;">
              Error loading component: ${String(error).replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
          `;

          onChunk(
            `<script>
              document.getElementById("H:${id}").outerHTML = ${JSON.stringify(errorHTML)};
            </script>`
          );

          // Remove from pending map
          suspenseBoundaries.delete(id);
        }
      }
    );

    // Wait for at least one boundary to resolve
    if (pendingPromises.length > 0) {
      await Promise.race(pendingPromises);
    }
  }

  // Add hydration completion marker
  onChunk(
    `<script>
      window.__HELIX_HYDRATION_COMPLETE = true;
      document.dispatchEvent(new Event('helix:hydrated'));
    </script>`
  );

  return Promise.resolve();
}

/**
 * Renders with suspense boundaries
 */
function renderWithSuspense(element: Element): {
  html: string;
  boundaries: Array<{ id: string; promise: Promise<any>; element: Element }>;
} {
  const boundaries: Array<{
    id: string;
    promise: Promise<any>;
    element: Element;
  }> = [];

  function renderElement(el: Element): string {
    try {
      if (typeof el.type === 'function') {
        const Component = el.type;
        const rendered = Component(el.props);
        return renderElement(rendered);
      }

      if (typeof el.type === 'string') {
        let html = `<${el.type}`;

        // Add attributes
        for (const [key, value] of Object.entries(el.props)) {
          if (key !== 'children' && key !== 'ref' && key !== 'key') {
            if (typeof value === 'boolean' && value) {
              html += ` ${key}`;
            } else if (value != null && value !== false) {
              html += ` ${key}="${String(value).replace(/"/g, '&quot;')}"`;
            }
          }
        }

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

        if (voidElements.has(el.type) && el.children.length === 0) {
          return `${html} />`;
        }

        html += '>';

        // Add children
        for (const child of el.children) {
          if (child == null) continue;

          if (
            typeof child === 'string' ||
            typeof child === 'number' ||
            typeof child === 'boolean'
          ) {
            html += String(child);
          } else {
            html += renderElement(child);
          }
        }

        html += `</${el.type}>`;
        return html;
      }

      // Fragment-like behavior
      return el.children
        .map(child => {
          if (child == null) return '';
          if (
            typeof child === 'string' ||
            typeof child === 'number' ||
            typeof child === 'boolean'
          ) {
            return String(child);
          }
          return renderElement(child);
        })
        .join('');
    } catch (error) {
      // Check if this is a suspense boundary
      if (error instanceof Promise) {
        // Generate a unique ID for this suspense boundary
        const id = `suspense-${Math.random().toString(36).substring(2, 9)}`;

        // Add to our boundaries
        boundaries.push({
          id,
          promise: error,
          element: el,
        });

        // Return a placeholder
        return `<template id="H:${id}">Loading...</template>`;
      }

      // Regular error, propagate
      throw error;
    }
  }

  const html = renderElement(element);
  return { html, boundaries };
}

/**
 * Splits a template into two parts: before and after the app placeholder
 */
function splitTemplate(template: string): [string, string] {
  const parts = template.split('<!--APP-->');

  if (parts.length !== 2) {
    throw new Error('Template must contain exactly one <!--APP--> placeholder');
  }

  return [parts[0], parts[1]];
}

/**
 * Default HTML template
 */
const defaultTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Helix App</title>
  <!--HEAD-->
</head>
<body>
  <div id="app"><!--APP--></div>
  <!--SCRIPTS-->
</body>
</html>
`.trim();
