# Core API Reference

This document provides detailed information about the core APIs in the Helix-Kit framework.

## Reactivity API

### createSignal

Creates a reactive signal with getter and setter functions.

```typescript
function createSignal<T>(initialValue: T): [
  // Getter
  () => T,
  // Setter
  (value: T | ((prev: T) => T)) => void
]
```

**Parameters:**

- `initialValue`: The initial value of the signal

**Returns:**

- A tuple containing a getter function and a setter function

**Example:**

```typescript
import { createSignal } from 'helix-kit';

// Create a signal with initial value 0
const [count, setCount] = createSignal(0);

// Read the value
console.log(count()); // 0

// Set a new value
setCount(1);
console.log(count()); // 1

// Update using the previous value
setCount(prev => prev + 1);
console.log(count()); // 2
```

### createEffect

Creates an effect that runs when its reactive dependencies change.

```typescript
function createEffect(fn: () => void | (() => void)): () => void
```

**Parameters:**

- `fn`: A function that will be executed when dependencies change. Can optionally return a cleanup function.

**Returns:**

- A function that can be called to manually dispose the effect

**Example:**

```typescript
import { createSignal, createEffect } from 'helix-kit';

const [count, setCount] = createSignal(0);

// Create an effect that depends on count
createEffect(() => {
  console.log(`Count changed to ${count()}`);
  
  // Optional cleanup function
  return () => {
    console.log('Effect cleanup');
  };
});

// This will trigger the effect
setCount(1);
```

### createMemo

Creates a memoized value that only recalculates when dependencies change.

```typescript
function createMemo<T>(fn: () => T): () => T
```

**Parameters:**

- `fn`: A function that computes the value

**Returns:**

- A getter function for the memoized value

**Example:**

```typescript
import { createSignal, createMemo } from 'helix-kit';

const [count, setCount] = createSignal(0);

// Create a memoized calculation
const doubleCount = createMemo(() => {
  console.log('Computing double count');
  return count() * 2;
});

console.log(doubleCount()); // "Computing double count" (logged), 0
console.log(doubleCount()); // 0 (no recomputation)

setCount(1);
console.log(doubleCount()); // "Computing double count" (logged), 2
```

### createResource

Creates a resource for asynchronous data fetching.

```typescript
function createResource<T, K>(
  source: () => K,
  fetcher: (source: K) => Promise<T>
): [
  // Resource getter
  () => T | undefined,
  // Resource metadata
  {
    loading: () => boolean,
    error: () => Error | null
  }
]
```

**Parameters:**

- `source`: A function that returns the resource key/input
- `fetcher`: A function that fetches the resource data given the source

**Returns:**

- A tuple with a getter function and an object with loading/error state

**Example:**

```typescript
import { createSignal, createResource } from 'helix-kit';

const [userId, setUserId] = createSignal('1');

// Create a resource that fetches user data
const [user, { loading, error }] = createResource(
  // Source function - when userId changes, refetch data
  () => userId(),
  
  // Fetcher function - how to get the data
  async (id) => {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
);

// Access the resource
function UserProfile() {
  return loading()
    ? "Loading..."
    : error()
      ? `Error: ${error().message}`
      : `User: ${user()?.name}`;
}
```

### createContext

Creates a context to share state across components without prop drilling.

```typescript
function createContext<T>(defaultValue: T): {
  Provider: (props: { value: T, children: any }) => any,
  use: () => T
}
```

**Parameters:**

- `defaultValue`: The default value if no provider is found

**Returns:**

- An object with Provider component and use function

**Example:**

```typescript
import { createContext, createSignal } from 'helix-kit';

// Create a theme context
const ThemeContext = createContext('light');

// Provider component
function ThemeProvider(props) {
  const [theme, setTheme] = createSignal(props.initialTheme || 'light');
  
  return ThemeContext.Provider({
    value: {
      theme: theme,
      toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
    },
    children: props.children
  });
}

// Consumer component
function ThemedButton() {
  const { theme, toggleTheme } = ThemeContext.use();
  
  return button({
    className: `btn-${theme()}`,
    onClick: toggleTheme
  }, 'Toggle Theme');
}
```

## Component API

### h (createElement)

Creates a virtual DOM element.

```typescript
function h(
  type: string | Function,
  props?: Record<string, any> | null,
  ...children: any[]
): Element
```

**Parameters:**

- `type`: Element type (HTML tag name or component function)
- `props`: Element properties/attributes
- `children`: Child elements or content

**Returns:**

- A virtual DOM element

**Example:**

```typescript
import { h } from 'helix-kit';

// Create a simple div element
const div = h('div', { className: 'container' }, 'Hello World');

// Create a component with children
const app = h('div', { className: 'app' },
  h('h1', null, 'My App'),
  h('p', null, 'Welcome to my app')
);

// Create a component with a component as its type
function Greeting({ name }) {
  return h('h1', null, `Hello, ${name}!`);
}

const element = h(Greeting, { name: 'World' });
```

### Fragment

A special component for returning multiple elements without a wrapper.

```typescript
function Fragment(props: { children: any }): any
```

**Parameters:**

- `props`: An object with children property

**Returns:**

- The children without a wrapper element

**Example:**

```typescript
import { h, Fragment } from 'helix-kit';

function Items() {
  return h(Fragment, null,
    h('li', null, 'Item 1'),
    h('li', null, 'Item 2'),
    h('li', null, 'Item 3')
  );
}

// With JSX
function Items() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  );
}
```

### render

Renders a virtual DOM element into a DOM container.

```typescript
function render(element: Element, container: HTMLElement): () => void
```

**Parameters:**

- `element`: The virtual DOM element to render
- `container`: The DOM container to render into

**Returns:**

- A cleanup function to unmount the rendered component

**Example:**

```typescript
import { h, render } from 'helix-kit';

const element = h('div', null, 'Hello World');
const container = document.getElementById('app');

// Render the element into the container
const cleanup = render(element, container);

// Later, to unmount:
cleanup();
```

## Lifecycle API

### onMount

Registers a callback to run when a component is mounted to the DOM.

```typescript
function onMount(callback: () => void | (() => void)): void
```

**Parameters:**

- `callback`: Function to run on mount, can return a cleanup function

**Example:**

```typescript
import { h, onMount } from 'helix-kit';

function Timer() {
  let intervalId;
  
  onMount(() => {
    // Set up timer when component mounts
    intervalId = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  });
  
  return h('div', null, 'Timer running...');
}
```

### onUnmount

Registers a callback to run when a component is removed from the DOM.

```typescript
function onUnmount(callback: () => void): void
```

**Parameters:**

- `callback`: Function to run on unmount

**Example:**

```typescript
import { h, onUnmount } from 'helix-kit';

function AnalyticsTracker() {
  onUnmount(() => {
    // Send final analytics event when component unmounts
    sendAnalytics('component_closed');
  });
  
  return h('div', null, 'Tracking...');
}
```

## Router API

### createRouter

Creates a client-side router for single-page applications.

```typescript
function createRouter(
  routes: Record<string, (params: Record<string, string>) => any>,
  options?: {
    initialUrl?: string;
    base?: string;
  }
): {
  Router: () => any;
  navigate: (to: string, options?: { replace?: boolean, state?: any }) => void;
  currentRoute: () => string;
}
```

**Parameters:**

- `routes`: Object mapping route patterns to handler functions
- `options`: Router configuration options

**Returns:**

- Object with Router component, navigate function, and currentRoute getter

**Example:**

```typescript
import { h, createRouter } from 'helix-kit';

const { Router, navigate } = createRouter({
  '/': () => h('h1', null, 'Home'),
  '/about': () => h('h1', null, 'About'),
  '/users/:id': ({ id }) => h('h1', null, `User ${id}`),
  '*': () => h('h1', null, 'Not Found')
});

function App() {
  return h('div', null,
    h('nav', null,
      h('a', { 
        href: '/',
        onClick: (e) => {
          e.preventDefault();
          navigate('/');
        }
      }, 'Home'),
      h('a', { 
        href: '/about',
        onClick: (e) => {
          e.preventDefault();
          navigate('/about');
        }
      }, 'About')
    ),
    h('main', null,
      h(Router, null)
    )
  );
}
```

## Store API

### createStore

Creates a centralized state store for managing application state.

```typescript
function createStore<T extends Record<string, any>>(options: {
  name?: string;
  state: T;
  debug?: {
    enabled?: boolean;
    logActions?: boolean;
  };
  plugins?: Array<(store: any) => any>;
}): {
  getState: <K extends keyof T>(path?: K) => K extends keyof T ? T[K] : T;
  setState: <K extends keyof T>(
    path: K | Partial<T>,
    value?: T[K]
  ) => void;
  subscribe: (
    pathOrCallback: ((state: T, prevState: T) => void) | keyof T,
    callback?: (newValue: any, oldValue: any) => void
  ) => () => void;
  createActions: <A>(actionsFactory: (store: any) => A) => A;
  createSelector: <R>(
    ...args: [...Array<() => any>, (...values: any[]) => R]
  ) => () => R;
}
```

**Parameters:**

- `options`: Store configuration options

**Returns:**

- Store API with methods for reading, updating, and subscribing to state

**Example:**

```typescript
import { createStore } from 'helix-kit';

// Create a store
const todoStore = createStore({
  name: 'todos',
  state: {
    items: [],
    filter: 'all'
  },
  debug: {
    enabled: true,
    logActions: true
  }
});

// Access store methods
const { getState, setState, subscribe, createActions } = todoStore;

// Read state
const todos = getState('items');

// Update state
setState('items', [...todos, { id: 1, text: 'New todo', completed: false }]);

// Subscribe to changes
const unsubscribe = subscribe('items', (newItems, oldItems) => {
  console.log('Items changed:', newItems);
});

// Create actions
const actions = createActions((store) => ({
  addTodo: (text) => {
    const todos = store.getState('items');
    store.setState('items', [...todos, { 
      id: Date.now(), 
      text, 
      completed: false 
    }]);
  },
  toggleTodo: (id) => {
    const todos = store.getState('items');
    store.setState('items', todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }
}));

// Use actions
actions.addTodo('Learn Helix-Kit');
```

## Suspense API

### Suspense

Component for handling asynchronous operations with fallback UI.

```typescript
function Suspense(props: { 
  fallback: any;
  children: any;
}): any
```

**Parameters:**

- `props`: Object with fallback UI and children

**Example:**

```typescript
import { h, Suspense, createResource } from 'helix-kit';

function UserProfile({ userId }) {
  const [user] = createResource(
    () => userId,
    async (id) => {
      const res = await fetch(`/api/users/${id}`);
      return res.json();
    }
  );
  
  return h('div', null,
    h('h1', null, user().name),
    h('p', null, user().email)
  );
}

function App() {
  return h(Suspense, {
    fallback: h('div', null, 'Loading...')
  },
    h(UserProfile, { userId: '123' })
  );
}
```

### lazy

Creates a component that is loaded only when rendered.

```typescript
function lazy<T extends (...args: any[]) => any>(
  factory: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> }
```

**Parameters:**

- `factory`: Function that returns a promise resolving to a module with a default export

**Returns:**

- Component function with preload method

**Example:**

```typescript
import { h, lazy, Suspense } from 'helix-kit';

// Lazy-loaded component
const AdminPanel = lazy(() => import('./AdminPanel'));

function App({ user }) {
  return h('div', null,
    h('h1', null, 'Dashboard'),
    
    // Only render admin panel for admins
    user.isAdmin && h(Suspense, { 
      fallback: h('div', null, 'Loading admin panel...')
    },
      h(AdminPanel, null)
    )
  );
}

// Preload the component in advance
AdminPanel.preload();
```

### ErrorBoundary

Component that catches JavaScript errors in its child component tree.

```typescript
function ErrorBoundary(props: {
  fallback: (props: { error: Error, retry: () => void }) => any;
  children: any;
}): any
```

**Parameters:**

- `props`: Object with fallback component and children

**Example:**

```typescript
import { h, ErrorBoundary } from 'helix-kit';

function BuggyCounter() {
  const [count, setCount] = createSignal(0);
  
  function handleClick() {
    setCount(count() + 1);
    if (count() >= 5) {
      // This will trigger the error boundary
      throw new Error('Count is too high!');
    }
  }
  
  return h('div', null,
    h('p', null, `Count: ${count()}`),
    h('button', { onClick: handleClick }, 'Increment')
  );
}

function App() {
  return h(ErrorBoundary, {
    fallback: ({ error, retry }) => h('div', null,
      h('p', null, `Error: ${error.message}`),
      h('button', { onClick: retry }, 'Retry')
    )
  },
    h(BuggyCounter, null)
  );
}
```

## Scheduler API

### scheduleTask

Schedules a task with a specified priority.

```typescript
function scheduleTask(
  callback: () => void,
  priority?: Priority
): number
```

**Parameters:**

- `callback`: The function to execute
- `priority`: Task priority (HIGH, NORMAL, or LOW)

**Returns:**

- Task ID that can be used to cancel the task

**Example:**

```typescript
import { scheduleTask, Priority } from 'helix-kit';

// Schedule high-priority task (e.g., UI update)
scheduleTask(() => {
  updateUI();
}, Priority.HIGH);

// Schedule low-priority task (e.g., analytics)
const taskId = scheduleTask(() => {
  sendAnalytics();
}, Priority.LOW);

// Cancel the task if needed
cancelTask(taskId);
```

### Priority

Enum defining task priority levels.

```typescript
enum Priority {
  HIGH = 0,    // Critical tasks (user input, animations)
  NORMAL = 1,  // Default priority
  LOW = 2      // Background tasks (logging, analytics)
}
```

### afterLayout

Schedules a callback to run after the browser has performed layout calculations.

```typescript
function afterLayout(callback: () => void): void
```

**Parameters:**

- `callback`: Function to execute after layout

**Example:**

```typescript
import { afterLayout } from 'helix-kit';

function expandPanel() {
  // Update DOM
  panel.classList.add('expanded');
  
  // Measure after layout is complete
  afterLayout(() => {
    const height = panel.scrollHeight;
    console.log(`Panel expanded to ${height}px`);
  });
}
```

### afterPaint

Schedules a callback to run after the browser has painted.

```typescript
function afterPaint(callback: () => void): void
```

**Parameters:**

- `callback`: Function to execute after paint

**Example:**

```typescript
import { afterPaint } from 'helix-kit';

function startAnimation() {
  // Set up animation
  element.classList.add('animate');
  
  // Run after animation starts
  afterPaint(() => {
    // Now animation has started
    capturePerformanceMetrics();
  });
}
```

## Utility API

### uniqueId

Generates a unique ID, optionally with a prefix.

```typescript
function uniqueId(prefix?: string): string
```

**Parameters:**

- `prefix`: Optional string prefix

**Returns:**

- A unique ID string

**Example:**

```typescript
import { uniqueId } from 'helix-kit';

const id1 = uniqueId();        // "a1b2c3"
const id2 = uniqueId('user_'); // "user_d4e5f6"
```

### debounce

Creates a debounced function that delays invoking the target function.

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

**Parameters:**

- `func`: The function to debounce
- `wait`: Delay in milliseconds

**Returns:**

- Debounced function

**Example:**

```typescript
import { debounce } from 'helix-kit';

// Create a debounced search function
const debouncedSearch = debounce((query) => {
  fetchSearchResults(query);
}, 300);

// Call the debounced function
searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### throttle

Creates a throttled function that limits how often the target function can be called.

```typescript
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void
```

**Parameters:**

- `func`: The function to throttle
- `limit`: Minimum time between calls in milliseconds

**Returns:**

- Throttled function

**Example:**

```typescript
import { throttle } from 'helix-kit';

// Create a throttled scroll handler
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

// Call the throttled function
window.addEventListener('scroll', throttledScroll);
```

### memoize

Creates a memoized version of a function that caches results.

```typescript
function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T
```

**Parameters:**

- `func`: The function to memoize
- `resolver`: Optional function to generate the cache key

**Returns:**

- Memoized function

**Example:**

```typescript
import { memoize } from 'helix-kit';

// Memoize an expensive calculation
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// Results are cached
console.log(fibonacci(40)); // Fast after the first call
```
