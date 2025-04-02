# Server-Side Rendering API Reference

This document provides detailed information about the Server-Side Rendering (SSR) APIs in the Helix-Kit framework.

## Basic SSR API

### renderToString

Renders a component to an HTML string.

```typescript
function renderToString(element: Element): string
```

**Parameters:**

- `element`: Component or element to render

**Returns:**

- HTML string representation

**Example:**

```typescript
import { h } from 'helix-kit';
import { renderToString } from 'helix-kit/ssr';

function App() {
  return h('div', { className: 'app' },
    h('h1', null, 'Hello Server'),
    h('p', null, 'This was rendered on the server')
  );
}

// Render the app to a string
const html = renderToString(h(App, {}));
console.log(html);
// Outputs: <div class="app"><h1>Hello Server</h1><p>This was rendered on the server</p></div>
```

### renderToHTML

Renders a component to a complete HTML document.

```typescript
function renderToHTML(
  element: Element,
  options?: {
    docType?: string;
    htmlAttributes?: Record<string, string>;
    head?: string | Array<Element | string>;
    bodyAttributes?: Record<string, string>;
    scripts?: Array<string | { src: string; async?: boolean; defer?: boolean }>;
    styles?: Array<string | { href: string; media?: string }>;
  }
): string
```

**Parameters:**

- `element`: Component or element to render
- `options`: Rendering options
  - `docType`: Document type declaration (default: `<!DOCTYPE html>`)
  - `htmlAttributes`: Attributes for the html tag (e.g., `{ lang: 'en' }`)
  - `head`: Content to include in the head section
  - `bodyAttributes`: Attributes for the body tag
  - `scripts`: Scripts to include in the document
  - `styles`: Stylesheets to include

**Returns:**

- Complete HTML document as string

**Example:**

```typescript
import { h } from 'helix-kit';
import { renderToHTML } from 'helix-kit/ssr';

function App() {
  return h('div', { id: 'app' },
    h('h1', null, 'Hello World')
  );
}

const html = renderToHTML(h(App, {}), {
  htmlAttributes: { lang: 'en' },
  head: [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    h('title', null, 'My SSR App')
  ],
  scripts: [
    { src: '/assets/main.js', defer: true }
  ],
  styles: [
    { href: '/assets/main.css' }
  ]
});

// html now contains a complete HTML document
```

## Streaming SSR API

### createStreamingRenderer

Creates a renderer that streams HTML progressively to the client.

```typescript
function createStreamingRenderer(
  element: Element,
  options?: {
    template?: string;
    docType?: string;
    head?: string | (() => string);
    scripts?: string[];
    styles?: string[];
    onChunk?: (chunk: string) => void;
  }
): ReadableStream
```

**Parameters:**

- `element`: Component or element to render
- `options`: Stream rendering options
  - `template`: HTML template with `<!--APP-->` placeholder
  - `docType`: Document type declaration
  - `head`: Head content or generator function
  - `scripts`: Scripts to include
  - `styles`: Stylesheets to include
  - `onChunk`: Callback for each HTML chunk

**Returns:**

- ReadableStream of HTML chunks

**Example:**

```typescript
import { h } from 'helix-kit';
import { createStreamingRenderer } from 'helix-kit/ssr';
import { createServer } from 'http';

function App() {
  return h('div', { id: 'app' },
    h('h1', null, 'Streaming SSR'),
    h('p', null, 'This content is streamed to the browser')
  );
}

// Create HTTP server that streams HTML
const server = createServer((req, res) => {
  // Set appropriate headers
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Transfer-Encoding': 'chunked'
  });
  
  // Create streaming renderer
  const stream = createStreamingRenderer(h(App, {}), {
    template: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Streaming App</title>
        <!--HEAD-->
      </head>
      <body>
        <!--APP-->
        <!--SCRIPTS-->
      </body>
      </html>
    `,
    scripts: ['/assets/client.js'],
    styles: ['/assets/styles.css'],
    onChunk: chunk => {
      // Write each chunk to the response
      res.write(chunk);
    }
  });
  
  // Pipe the stream to the response
  stream.pipeTo(
    new WritableStream({
      write(chunk) {
        // Chunks are already handled by onChunk
      },
      close() {
        res.end();
      },
      abort(err) {
        console.error('Streaming error:', err);
        res.end('Error rendering page');
      }
    })
  ).catch(error => {
    console.error('Stream error:', error);
    res.end('</div></body></html>');
  });
});

server.listen(3000);
```

### createProgressiveRenderer

Creates a progressive renderer that supports suspense and streaming.

```typescript
function createProgressiveRenderer(
  element: Element,
  options?: {
    template?: string;
    docType?: string;
    head?: string | (() => string);
    scripts?: string[];
    styles?: string[];
    onChunk?: (chunk: string) => void;
  }
): ReadableStream
```

**Parameters:**

- Same as `createStreamingRenderer`

**Returns:**

- ReadableStream of HTML chunks with progressive enhancement

**Example:**

```typescript
import { h, createResource, Suspense } from 'helix-kit';
import { createProgressiveRenderer, createSuspenseBoundary } from 'helix-kit/ssr';

// Data fetching function
async function fetchUser(id) {
  // Simulate API call
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// Component with suspense
function UserProfile({ id }) {
  // This will suspend rendering until the data is available
  const userData = createSuspenseBoundary(fetchUser(id));
  
  return h('div', { className: 'user-profile' },
    h('h2', null, userData.name),
    h('p', null, userData.email)
  );
}

function App() {
  return h('div', { id: 'app' },
    h('h1', null, 'User Profile'),
    h(Suspense, { 
      fallback: h('div', null, 'Loading user...')
    },
      h(UserProfile, { id: '123' })
    )
  );
}

// Use in server handler
function handleRequest(req, res) {
  const stream = createProgressiveRenderer(h(App, {}), {
    // Options...
    onChunk: chunk => res.write(chunk)
  });
  
  // Handle stream...
}
```

## Suspense API for SSR

### createSuspenseBoundary

Creates a suspense boundary for asynchronous data fetching during SSR.

```typescript
function createSuspenseBoundary<T>(promise: Promise<T>): T
```

**Parameters:**

- `promise`: Promise that resolves to data

**Returns:**

- Data (when available) or throws the promise to suspend rendering

**Example:**

```typescript
import { h } from 'helix-kit';
import { createSuspenseBoundary } from 'helix-kit/ssr';

// Data fetching function
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}

// Component with suspense boundary
function DataComponent() {
  // This will suspend rendering until the data is ready
  const data = createSuspenseBoundary(fetchData());
  
  return h('div', null,
    h('h2', null, data.title),
    h('p', null, data.description)
  );
}
```

## Hydration API

### hydrate

Hydrates server-rendered HTML with client-side interactivity.

```typescript
function hydrate(element: Element, container: HTMLElement): () => void
```

**Parameters:**

- `element`: Component or element to hydrate
- `container`: DOM container with server-rendered HTML

**Returns:**

- Cleanup function to unmount the component

**Example:**

```typescript
import { h } from 'helix-kit';
import { hydrate } from 'helix-kit/ssr';

// App component
function App(props) {
  return h('div', null,
    h('h1', null, 'Hello, ' + props.name),
    h('button', { 
      onClick: () => alert('Button clicked!')
    }, 'Click Me')
  );
}

// Client-side hydration
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  
  // Get initial props from server
  const initialProps = window.__INITIAL_PROPS__ || {};
  
  // Hydrate the app
  hydrate(h(App, initialProps), container);
});
```

### isHydrating

Returns whether the current render is a hydration render.

```typescript
function isHydrating(): boolean
```

**Returns:**

- True if currently hydrating, false otherwise

**Example:**

```typescript
import { h, createSignal } from 'helix-kit';
import { isHydrating } from 'helix-kit/ssr';

function App() {
  // Skip some client-only logic during hydration
  const [counter, setCounter] = createSignal(0);
  
  // Only set up event listeners if not hydrating
  if (!isHydrating()) {
    window.addEventListener('resize', () => {
      console.log('Window resized');
    });
  }
  
  return h('div', null,
    h('button', { 
      onClick: () => setCounter(counter() + 1)
    }, `Count: ${counter()}`)
  );
}
```

## Server Integration

### createServerRenderer

Creates a renderer function for use in a server environment.

```typescript
function createServerRenderer(options?: {
  template?: string;
  enableStreaming?: boolean;
  maxRenderTime?: number;
  cacheSize?: number;
}): (element: Element, context?: object) => {
  html: string | ReadableStream;
  statusCode?: number;
  headers?: Record<string, string>;
  cache?: { key: string; expires?: number };
}
```

**Parameters:**

- `options`: Server renderer options
  - `template`: HTML template
  - `enableStreaming`: Whether to enable streaming (default: true)
  - `maxRenderTime`: Maximum render time in ms (default: 5000)
  - `cacheSize`: Size of render cache (default: 100)

**Returns:**

- Renderer function for server use

**Example:**

```typescript
import { h } from 'helix-kit';
import { createServerRenderer } from 'helix-kit/ssr';
import express from 'express';

// Create renderer
const renderApp = createServerRenderer({
  template: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>{{title}}</title>
    </head>
    <body>
      <div id="app"><!--APP--></div>
      <script src="/assets/client.js"></script>
    </body>
    </html>
  `,
  enableStreaming: true
});

// Create Express app
const app = express();

// Routes
app.get('/', (req, res) => {
  const { html, headers } = renderApp(
    h(HomePage, {}),
    { title: 'Home Page' }
  );
  
  // Set headers
  for (const [key, value] of Object.entries(headers || {})) {
    res.setHeader(key, value);
  }
  
  // Send response
  if (html instanceof ReadableStream) {
    // Handle streaming
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Transfer-Encoding': 'chunked'
    });
    
    const reader = html.getReader();
    const encoder = new TextEncoder();
    
    function readChunk() {
      reader.read().then(({ done, value }) => {
        if (done) {
          res.end();
          return;
        }
        
        res.write(value);
        readChunk();
      }).catch(error => {
        console.error('Stream error:', error);
        res.end();
      });
    }
    
    readChunk();
  } else {
    // Handle non-streaming
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
});

app.listen(3000);
```

### renderToResponse

Renders a component directly to an HTTP response.

```typescript
function renderToResponse(
  element: Element,
  response: { 
    writeHead: (status: number, headers: Record<string, string>) => void;
    write: (chunk: string | Buffer) => void;
    end: (chunk?: string | Buffer) => void;
  },
  options?: {
    status?: number;
    headers?: Record<string, string>;
    template?: string;
    docType?: string;
    streaming?: boolean;
  }
): Promise<void>
```

**Parameters:**

- `element`: Component or element to render
- `response`: HTTP response-like object
- `options`: Rendering options
  - `status`: HTTP status code (default: 200)
  - `headers`: Additional HTTP headers
  - `template`: HTML template
  - `docType`: Document type declaration
  - `streaming`: Whether to use streaming (default: true)

**Returns:**

- Promise that resolves when rendering is complete

**Example:**

```typescript
import { h } from 'helix-kit';
import { renderToResponse } from 'helix-kit/ssr';
import { createServer } from 'http';

// Create HTTP server
const server = createServer(async (req, res) => {
  if (req.url === '/') {
    // Render home page
    await renderToResponse(
      h(HomePage, {}),
      res,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache'
        },
        streaming: true
      }
    );
  } else if (req.url?.startsWith('/user/')) {
    // Extract user ID from URL
    const userId = req.url.split('/').pop();
    
    try {
      // Fetch user data
      const userData = await fetchUser(userId);
      
      // Render user page
      await renderToResponse(
        h(UserPage, { user: userData }),
        res,
        { status: 200 }
      );
    } catch (error) {
      // Render error page
      await renderToResponse(
        h(ErrorPage, { error: error.message }),
        res,
        { status: 404 }
      );
    }
  } else {
    // Render not found page
    await renderToResponse(
      h(NotFoundPage, {}),
      res,
      { status: 404 }
    );
  }
});

server.listen(3000);
```

## Head Management

### createHeadManager

Creates a head manager for managing document head elements during SSR.

```typescript
function createHeadManager(): {
  title: (value: string) => void;
  meta: (attributes: Record<string, string>) => void;
  link: (attributes: Record<string, string>) => void;
  script: (attributes: Record<string, string>, content?: string) => void;
  style: (content: string, attributes?: Record<string, string>) => void;
  base: (attributes: Record<string, string>) => void;
  getHead: () => string;
}
```

**Returns:**

- Head manager object

**Example:**

```typescript
import { h } from 'helix-kit';
import { createHeadManager, renderToString } from 'helix-kit/ssr';

// Create head manager
const headManager = createHeadManager();

// Head component
function Head({ title, description }) {
  // Update head elements
  headManager.title(title);
  headManager.meta({ name: 'description', content: description });
  headManager.link({ rel: 'stylesheet', href: '/styles.css' });
  
  // Return null (doesn't render to DOM)
  return null;
}

// App component
function App() {
  return h('div', null,
    h(Head, { 
      title: 'My App', 
      description: 'A server-rendered app'
    }),
    h('h1', null, 'Hello World')
  );
}

// Render app
const appHtml = renderToString(h(App, {}));

// Get head HTML
const headHtml = headManager.getHead();

// Complete HTML
const html = `
  <!DOCTYPE html>
  <html>
    <head>
      ${headHtml}
    </head>
    <body>
      ${appHtml}
    </body>
  </html>
`;
```

## Data Fetching

### createDataLoader

Creates a data loader for coordinating data fetching during SSR.

```typescript
function createDataLoader(): {
  load: <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { cache?: boolean; maxAge?: number }
  ) => Promise<T>;
  preload: <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { cache?: boolean; maxAge?: number }
  ) => void;
  getInitialData: () => Record<string, any>;
}
```

**Returns:**

- Data loader object

**Example:**

```typescript
import { h } from 'helix-kit';
import { createDataLoader, renderToHTML } from 'helix-kit/ssr';

// Create data loader
const dataLoader = createDataLoader();

// Data fetching components
function UserData({ id }) {
  // Load user data (this will be awaited during SSR)
  const userData = dataLoader.load(
    `user-${id}`,
    () => fetch(`https://api.example.com/users/${id}`).then(r => r.json()),
    { cache: true, maxAge: 60000 } // Cache for 1 minute
  );
  
  return h('div', null,
    h('h2', null, userData.name),
    h('p', null, userData.email)
  );
}

// App component
function App({ userId }) {
  return h('div', null,
    h('h1', null, 'User Profile'),
    h(UserData, { id: userId })
  );
}

// Server handler
async function handleRequest(req, res) {
  const userId = req.params.id;
  
  // Preload critical data
  dataLoader.preload(
    `user-${userId}`,
    () => fetch(`https://api.example.com/users/${userId}`).then(r => r.json())
  );
  
  // Render app (will await all data)
  const html = await renderToHTML(h(App, { userId }));
  
  // Get initial data for client hydration
  const initialData = dataLoader.getInitialData();
  
  // Add data to HTML
  const fullHtml = html.replace(
    '</body>',
    `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script></body>`
  );
  
  res.send(fullHtml);
}
```
