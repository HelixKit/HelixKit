/**
 * Server implementation for Helix SSR
 */

import { renderToHTML } from './render';
import { h } from '../core/component';
import type { Element } from '../core/types';

interface ServerOptions {
  port?: number;
  host?: string;
  assets?: string;
  template?: string;
  hydrate?: boolean;
}

/**
 * Creates a server for Helix SSR applications
 */
export function createServer(
  AppComponent: () => Element,
  options: ServerOptions = {}
) {
  const {
    port = 3000,
    host = 'localhost',
    assets = 'public',
    template,
    hydrate = true,
  } = options;

  // Create the server
  const server = Bun.serve({
    port,
    hostname: host,
    async fetch(req) {
      const url = new URL(req.url);

      // Serve static assets
      if (url.pathname.startsWith(`/${assets}/`)) {
        const filePath = url.pathname.slice(1); // Remove leading slash
        const file = Bun.file(filePath);

        if (await file.exists()) {
          return new Response(file);
        }

        return new Response('Not found', { status: 404 });
      }

      // For API routes, you could add your API handlers here
      if (url.pathname.startsWith('/api/')) {
        return handleAPIRequest(req);
      }

      // For all other routes, render the app
      try {
        // Create app element with route context
        const app = h(AppComponent, {
          url: url.pathname,
          query: Object.fromEntries(url.searchParams),
        });

        // Render to HTML
        const html = renderToHTML(app, {
          template,
          hydrate,
          scripts: ['/public/bundle.js'],
          styles: ['/public/styles.css'],
          head: `<meta name="description" content="Helix SSR App">`,
        });

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } catch (error) {
        console.error('Error rendering app:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        return new Response(`Server Error: ${errorMessage}`, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
    },
  });

  console.log(
    `Helix SSR server running at http://${server.hostname}:${server.port}`
  );

  return {
    server,
    address: `http://${server.hostname}:${server.port}`,
    stop: () => server.stop(),
  };
}

/**
 * Handles API requests
 */
function handleAPIRequest(_req: Request): Response {
  // This would implement your API routes
  // For now, just return a basic response
  return new Response(JSON.stringify({ message: 'Helix API' }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
