// SSR server entry point
import { createServer } from 'http';
import { createProgressiveRenderer, renderToHTML } from 'helix-kit/ssr';
import App from '../src/App';
import { h } from 'helix-kit';

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer((req, res) => {
  // Basic routing
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  // Handle static assets
  if (url.pathname.startsWith('/public')) {
    // For a real app, serve static files here
    res.writeHead(404);
    res.end('Static file not found');
    return;
  }
  
  // API routes
  if (url.pathname.startsWith('/api')) {
    handleApiRequest(req, res, url);
    return;
  }
  
  // For all other routes, render the app
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Transfer-Encoding': 'chunked'
  });
  
  // Initial data for hydration
  const initialData = {
    url: url.pathname,
    timestamp: Date.now()
  };

  // Use progressive streaming renderer with Suspense support
  const renderer = createProgressiveRenderer({
    template: getHtmlTemplate(initialData),
    docType: '<!DOCTYPE html>',
    scripts: ['/public/client.js'],
    styles: ['/public/styles.css'],
    hydrate: true
  });
  
  // Render the app to a stream
  const stream = renderer(h(App, { initialData, url: url.pathname }));

  // Stream HTML to client
  stream.pipeTo(
    new WritableStream({
      write(chunk) {
        res.write(chunk);
      },
      close() {
        res.end();
      },
      abort(err) {
        console.error('Streaming error:', err);
        res.end('An error occurred while rendering the page');
      }
    })
  ).catch(error => {
    console.error('Server render error:', error);
    res.end('</div></body></html>');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`SSR server running at http://localhost:${PORT}`);
});

// Helper function to get HTML template
function getHtmlTemplate(initialData: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Helix-Kit SSR App</title>
      <!--HEAD-->
      <script>
        // Pass initial data to client for hydration
        window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};
      </script>
    </head>
    <body>
      <div id="app"><!--APP--></div>
      <!--SCRIPTS-->
    </body>
    </html>
  `;
}

// Handle API requests
function handleApiRequest(req: any, res: any, url: URL) {
  // Example API endpoint
  if (url.pathname === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        message: 'Hello from Helix-Kit SSR API!',
        timestamp: Date.now()
      }
    }));
    return;
  }
  
  // 404 for unknown API endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'API endpoint not found'
  }));
}