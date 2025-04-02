# Server-Side Rendering

Server-Side Rendering (SSR) is a technique that allows you to render your Helix-Kit application on the server before sending it to the client. This can improve performance, SEO, and user experience.

## Benefits of SSR

- **Improved SEO**: Search engines can easily index the content of your pages
- **Faster Time to First Contentful Paint**: Users see content sooner
- **Better Performance on Low-End Devices**: Less JavaScript processing required initially
- **Consistent Experience**: Content is visible before JavaScript loads or if it fails to load
- **Social Media Previews**: Social media platforms can extract metadata and preview images

## Basic Server-Side Rendering

### renderToString

The simplest way to implement SSR is with the `renderToString` function:

```tsx
import { h } from 'helix-kit';
import { renderToString } from 'helix-kit/ssr';

function App() {
  return h('div', { className: 'app' },
    h('h1', {}, 'Hello World'),
    h('p', {}, 'This was rendered on the server')
  );
}

// Render the app to a string
const html = renderToString(h(App, {}));

// Send the HTML to the client
function handleRequest(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My SSR App</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
}
```

### renderToHTML

For a more complete solution, use `renderToHTML`:

```tsx
import { h } from 'helix-kit';
import { renderToHTML } from 'helix-kit/ssr';

function App() {
  return h('div', { className: 'app' },
    h('h1', {}, 'Hello World'),
    h('p', {}, 'This was rendered on the server')
  );
}

function handleRequest(req, res) {
  const html = renderToHTML(h(App, {}), {
    docType: '<!DOCTYPE html>',
    htmlAttributes: { lang: 'en' },
    head: [
      h('title', {}, 'My SSR App'),
      h('meta', { charset: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('link', { rel: 'stylesheet', href: '/styles.css' })
    ],
    scripts: [
      { src: '/client.js', defer: true }
    ]
  });
  
  res.send(html);
}
```

## Hydration

Hydration is the process of attaching event listeners and making the server-rendered HTML interactive.

```tsx
// client.js
import { h, hydrate } from 'helix-kit';
import { hydrate } from 'helix-kit/ssr';
import App from './App';

// Hydrate the app
const root = document.getElementById('app');
hydrate(h(App, {}), root);
```

### Handling State During Hydration

You'll need to share state between the server and client:

```tsx
// server.js
import { renderToHTML } from 'helix-kit/ssr';

function handleRequest(req, res) {
  // Initialize state based on the request
  const initialState = {
    user: getUser(req),
    products: fetchProducts()
  };
  
  const html = renderToHTML(h(App, { initialState }), {
    // ...options
  });
  
  // Embed the state in the HTML
  const htmlWithState = html.replace(
    '</body>',
    `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script></body>`
  );
  
  res.send(htmlWithState);
}

// client.js
import { hydrate } from 'helix-kit/ssr';

// Get the initial state from the server
const initialState = window.__INITIAL_STATE__ || {};

// Hydrate with the same state
hydrate(h(App, { initialState }), document.getElementById('app'));
```

## Streaming SSR

Streaming SSR allows the server to send content progressively as it's rendered:

```tsx
import { createStreamingRenderer } from 'helix-kit/ssr';

function handleRequest(req, res) {
  // Set up the response for streaming
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Transfer-Encoding': 'chunked'
  });
  
  // Create a streaming renderer
  const stream = createStreamingRenderer(h(App, {}), {
    template: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Streaming SSR</title>
          <!--HEAD-->
        </head>
        <body>
          <div id="app"><!--APP--></div>
          <!--SCRIPTS-->
        </body>
      </html>
    `,
    scripts: ['/client.js'],
    styles: ['/styles.css'],
    onChunk: chunk => {
      // Send each chunk to the client as it's ready
      res.write(chunk);
    }
  });
  
  // Handle stream completion
  stream.pipeTo(
    new WritableStream({
      close() {
        res.end();
      },
      abort(err) {
        console.error('Stream error:', err);
        res.end('Error rendering page');
      }
    })
  );
}
```

## Progressive Rendering with Suspense

Helix-Kit's progressive rendering allows you to integrate Suspense with SSR:

```tsx
import { h, Suspense, createResource } from 'helix-kit';
import { createProgressiveRenderer, createSuspenseBoundary } from 'helix-kit/ssr';

// Component with data fetching
function UserProfile({ id }) {
  // This will suspend rendering until data is ready
  const userData = createSuspenseBoundary(fetchUserData(id));
  
  return h('div', { className: 'user-profile' },
    h('h2', {}, userData.name),
    h('p', {}, userData.email)
  );
}

// App with Suspense boundaries
function App() {
  return h('div', { className: 'app' },
    h('h1', {}, 'User Dashboard'),
    
    // Critical content renders immediately
    h('div', { className: 'header' }, 'Loading user...'),
    
    // Non-critical content can suspend
    h(Suspense, {
      fallback: h('div', { className: 'loading' }, 'Loading user data...')
    },
      h(UserProfile, { id: '123' })
    )
  );
}

// Progressive rendering server
function handleRequest(req, res) {
  // Set up for streaming
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Transfer-Encoding': 'chunked'
  });
  
  // Create a progressive renderer
  const stream = createProgressiveRenderer(h(App, {}), {
    // Configuration...
    onChunk: chunk => res.write(chunk)
  });
  
  // Handle stream...
}
```

### How Progressive Rendering Works

1. The server renders the initial HTML with placeholders for suspended components
2. This initial HTML is streamed to the client immediately
3. The server continues to fetch data for suspended components
4. As data becomes available, the server renders the components
5. These rendered components are sent as HTML chunks with JavaScript to replace the placeholders
6. The client progressively enhances the page as chunks arrive

## Server Integration

### Node.js with Express

```tsx
import express from 'express';
import { h } from 'helix-kit';
import { renderToHTML } from 'helix-kit/ssr';
import App from './App';

const app = express();

// Serve static assets
app.use(express.static('public'));

// Handle all routes with SSR
app.get('*', (req, res) => {
  const html = renderToHTML(h(App, { url: req.url }));
  res.send(html);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Bun

```tsx
import { h } from 'helix-kit';
import { renderToHTML } from 'helix-kit/ssr';
import App from './App';

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Serve static assets
    if (url.pathname.startsWith('/public/')) {
      return new Response(Bun.file('./public' + url.pathname.slice(7)));
    }
    
    // Render the app
    const html = renderToHTML(h(App, { url: url.pathname }));
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

console.log(`Server running at http://localhost:${server.port}`);
```

## SEO Optimization

Enhance the SEO of your server-rendered application:

```tsx
// Head component for managing meta tags
function Head(props) {
  return h('head', {},
    h('title', {}, props.title),
    h('meta', { name: 'description', content: props.description }),
    h('meta', { property: 'og:title', content: props.title }),
    h('meta', { property: 'og:description', content: props.description }),
    h('meta', { property: 'og:image', content: props.image }),
    h('meta', { name: 'twitter:card', content: 'summary_large_image' })
  );
}

// Usage in route component
function ProductPage({ product }) {
  return h('div', {},
    h(Head, {
      title: `${product.name} | My Store`,
      description: product.description,
      image: product.image
    }),
    h('h1', {}, product.name),
    // Page content...
  );
}
```

## Performance Optimization

### Caching

```tsx
import { renderToHTML } from 'helix-kit/ssr';

// Simple in-memory cache
const cache = new Map();

function handleRequest(req, res) {
  const url = req.url;
  
  // Check cache first
  if (cache.has(url)) {
    const { html, timestamp } = cache.get(url);
    
    // Check if cache is still fresh (5 minutes)
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      res.send(html);
      return;
    }
  }
  
  // Render the page
  const html = renderToHTML(h(App, { url }));
  
  // Store in cache
  cache.set(url, {
    html,
    timestamp: Date.now()
  });
  
  res.send(html);
}
```

### Selective Hydration

```tsx
// client.js
import { h, hydrate } from 'helix-kit';

// Hydrate critical components first
hydrate(
  h(App, { hydrate: 'critical' }), 
  document.getElementById('app')
);

// Hydrate non-critical components after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    hydrate(
      h(App, { hydrate: 'all' }),
      document.getElementById('app')
    );
  }, 0);
});
```

## Common Patterns

### Data Fetching

```tsx
// server.js
import { createDataLoader } from 'helix-kit/ssr';

// Create a data loader
const dataLoader = createDataLoader();

function handleRequest(req, res) {
  // Load data during SSR
  const products = dataLoader.load(
    'products',
    () => fetchProducts(),
    { cache: true, maxAge: 60000 }
  );
  
  const user = dataLoader.load(
    `user-${getUserId(req)}`,
    () => fetchUser(getUserId(req))
  );
  
  // Render after all data is loaded
  const html = renderToHTML(h(App, { products, user }));
  
  // Get all loaded data for hydration
  const initialData = dataLoader.getInitialData();
  const htmlWithData = html.replace(
    '</body>',
    `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script></body>`
  );
  
  res.send(htmlWithData);
}
```

### Handling Environment Differences

```tsx
// isomorphic-api.js
export async function fetchData(endpoint) {
  // Different fetching strategies for server and client
  if (typeof window === 'undefined') {
    // Server: Direct file system or internal API call
    const data = await readDataFromDatabase(endpoint);
    return data;
  } else {
    // Client: Fetch from API
    const response = await fetch(`/api/${endpoint}`);
    return response.json();
  }
}
```

## Troubleshooting

### Hydration Mismatch Errors

These occur when the HTML rendered on the server doesn't match the HTML rendered on the client during hydration:

```tsx
// Good: Same component on server and client
function Counter({ initialCount }) {
  const [count, setCount] = createSignal(initialCount);
  return h('div', {}, count());
}

// Bad: Different output on server and client
function Counter({ initialCount }) {
  const [count, setCount] = createSignal(initialCount);
  
  // This will cause a hydration mismatch
  return h('div', {}, 
    typeof window === 'undefined'
      ? 'Server count: ' + count()  // Server renders this
      : 'Client count: ' + count()  // Client renders this
  );
}
```

### Handling Window/Document Access

```tsx
// Safe way to access browser APIs
function useBrowserFeature() {
  const [value, setValue] = createSignal(null);
  
  onMount(() => {
    // Only runs on the client after hydration
    setValue(window.localStorage.getItem('key'));
  });
  
  return value;
}
```

## Next Steps

- Experiment with different SSR strategies
- Set up server-side routing
- Implement code splitting with dynamic imports
- Add build-time static generation for highly static pages
- Learn about edge rendering for faster global performance
