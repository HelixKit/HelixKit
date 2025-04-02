/**
 * Server-side rendering for Helix
 */

import { renderToString } from '../core/render';
import type { Element } from '../core/types';

/**
 * Options for server-side rendering
 */
export interface SSROptions {
  template?: string;
  hydrate?: boolean;
  streaming?: boolean;
  docType?: string;
  head?: string | (() => string);
  scripts?: string[];
  styles?: string[];
}

/**
 * Default HTML template
 */
const DEFAULT_TEMPLATE = `
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

/**
 * Renders a Helix app to an HTML string
 */
export function renderToHTML(
  element: Element,
  options: SSROptions = {}
): string {
  const {
    template = DEFAULT_TEMPLATE,
    hydrate = true,
    docType = '<!DOCTYPE html>',
    head = '',
    scripts = [],
    styles = [],
  } = options;

  // Render the app
  const appHTML = renderToString(element);

  // Process the template
  let html = template.replace('<!--APP-->', appHTML);

  // Add head content
  const headContent = typeof head === 'function' ? head() : head;
  html = html.replace('<!--HEAD-->', headContent);

  // Add styles
  const stylesHTML = styles
    .map(href => `<link rel="stylesheet" href="${href}">`)
    .join('\n  ');

  html = html.replace('<!--HEAD-->', match => `${match}\n  ${stylesHTML}`);

  // Add scripts
  const scriptsHTML = scripts
    .map(src => `<script src="${src}"></script>`)
    .join('\n  ');

  if (hydrate) {
    // Add hydration script
    const hydrationScript = `
  <script>
    window.__HELIX_HYDRATE__ = true;
    window.__HELIX_DATA__ = ${JSON.stringify({})};
  </script>
  <script src="/helix-hydrate.js" defer></script>
    `.trim();

    html = html.replace(
      '<!--SCRIPTS-->',
      `${hydrationScript}\n  ${scriptsHTML}`
    );
  } else {
    html = html.replace('<!--SCRIPTS-->', scriptsHTML);
  }

  // Ensure doctype
  if (!html.startsWith('<!DOCTYPE')) {
    html = `${docType}\n${html}`;
  }

  return html;
}

/**
 * Creates a progressive renderer for SSR
 * This allows parts of the page to be streamed immediately while others are still rendering
 */
export function createProgressiveRenderer(options: SSROptions = {}) {
  const {
    template = DEFAULT_TEMPLATE,
    hydrate = true,
    docType = '<!DOCTYPE html>',
    head = '',
    scripts = [],
    styles = [],
  } = options;

  /**
   * Renders an app to a stream with progressive enhancement
   */
  return function renderToStream(element: Element) {
    // Create a text encoder for the stream
    const encoder = new TextEncoder();
    
    // Create a readable stream
    const stream = new ReadableStream({
      start(controller) {
        // Send the initial HTML (head, opening tags)
        const initialHTML = template
          .split('<!--APP-->')[0]
          .replace('<!--HEAD-->', typeof head === 'function' ? head() : head || '');
        
        controller.enqueue(encoder.encode(initialHTML));
        
        // Render the app content
        const html = renderToString(element);
        controller.enqueue(encoder.encode(html));
        
        // Send the closing HTML
        const finalPart = template.split('<!--APP-->')[1];
        controller.enqueue(encoder.encode(finalPart));
        
        // Close the stream
        controller.close();
      }
    });
    
    return stream;
  };
}

/**
 * Creates a streaming renderer
 */
export function createStreamingRenderer(
  element: Element,
  options: SSROptions = {}
): ReadableStream {
  const encoder = new TextEncoder();

  // Split template
  const { template = DEFAULT_TEMPLATE } = options;
  const [beforeApp, afterApp] = splitTemplate(template);

  return new ReadableStream({
    start(controller) {
      // Send the beginning of the template
      controller.enqueue(encoder.encode(beforeApp));

      // Render the app
      const appHTML = renderToString(element);
      controller.enqueue(encoder.encode(appHTML));

      // Send the end of the template
      controller.enqueue(encoder.encode(afterApp));

      controller.close();
    },
  });
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
