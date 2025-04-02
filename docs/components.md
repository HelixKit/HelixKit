# Components

Components are the building blocks of Helix applications. They encapsulate UI, behavior, and state into reusable pieces.

## Creating Components

In Helix, components are functions that return a description of UI elements. They can use the `h` function to create virtual DOM elements or JSX syntax.

### Using the `h` Function

```tsx
import { h } from 'helix-kit';

function Button({ label, onClick }) {
  return h('button', { 
    className: 'button',
    onClick: onClick
  }, label);
}
```

### Using JSX

```tsx
import { h } from 'helix-kit';

function Button({ label, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {label}
    </button>
  );
}
```

## Component Props

Props are the inputs to your components. They are passed as a single object parameter to your component function.

```tsx
import { h } from 'helix-kit';

// Props definition
interface UserProfileProps {
  name: string;
  age: number;
  avatar?: string;
  onUpdate?: (id: string) => void;
}

// Component with typed props
function UserProfile(props: UserProfileProps) {
  return (
    <div className="user-profile">
      {props.avatar && <img src={props.avatar} alt={props.name} />}
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
      {props.onUpdate && (
        <button onClick={() => props.onUpdate?.(props.name)}>Update</button>
      )}
    </div>
  );
}
```

### Props Destructuring

For cleaner code, destructure your props:

```tsx
function UserProfile({ name, age, avatar, onUpdate }: UserProfileProps) {
  // Component logic
}
```

## Component State

Components can have their own internal state using `createSignal`.

```tsx
import { h, createSignal } from 'helix-kit';

function Counter() {
  const [count, setCount] = createSignal(0);
  
  return (
    <div className="counter">
      <p>Current count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
      <button onClick={() => setCount(count() - 1)}>Decrement</button>
    </div>
  );
}
```

## Component Composition

Components can be composed together to build complex UIs from simple parts.

```tsx
import { h } from 'helix-kit';

function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <Card title={user.name}>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </Card>
  );
}
```

## Component Lifecycle

Helix provides hooks to manage component lifecycle:

```tsx
import { h, onMount, onUnmount, createSignal } from 'helix-kit';

function Timer() {
  const [seconds, setSeconds] = createSignal(0);
  let intervalId;
  
  onMount(() => {
    // Code that runs when the component is added to the DOM
    intervalId = setInterval(() => {
      setSeconds(seconds() + 1);
    }, 1000);
  });
  
  onUnmount(() => {
    // Cleanup code that runs when the component is removed
    clearInterval(intervalId);
  });
  
  return <div>Seconds elapsed: {seconds()}</div>;
}
```

## Conditional Rendering

Components can conditionally render parts of the UI:

```tsx
import { h, createSignal } from 'helix-kit';

function ToggleContent() {
  const [isVisible, setIsVisible] = createSignal(false);
  
  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible())}>
        {isVisible() ? 'Hide' : 'Show'} Content
      </button>
      
      {isVisible() && (
        <div className="content">
          This content can be toggled on and off.
        </div>
      )}
    </div>
  );
}
```

## Lists and Keys

When rendering lists, use unique keys to help Helix track items efficiently:

```tsx
import { h } from 'helix-kit';

function TodoList({ todos }) {
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id}>
          <input 
            type="checkbox" 
            checked={todo.completed} 
          />
          <span>{todo.text}</span>
        </li>
      ))}
    </ul>
  );
}
```

## Fragments

When you need to return multiple elements without a wrapper, use Fragments:

```tsx
import { h, Fragment } from 'helix-kit';

function UserDetails({ user }) {
  return (
    <>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </>
  );
}
```

## Error Boundaries

Error boundaries catch errors in their child components:

```tsx
import { h, ErrorBoundary } from 'helix-kit';

function App() {
  return (
    <div className="app">
      <ErrorBoundary
        fallback={({ error, retry }) => (
          <div className="error-box">
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
            <button onClick={retry}>Try Again</button>
          </div>
        )}
      >
        <UserProfile id="123" />
      </ErrorBoundary>
    </div>
  );
}
```

## Lazy Components

Lazy loading improves performance by loading components only when needed:

```tsx
import { h, lazy, Suspense } from 'helix-kit';

// Import the component lazily
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div className="app">
      <h1>My App</h1>
      
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## Context API

Share state across components without prop drilling:

```tsx
import { h, createContext, useContext, createSignal } from 'helix-kit';

// Create a context with default value
const ThemeContext = createContext('light');

function ThemedButton() {
  // Use the context value
  const theme = useContext(ThemeContext);
  
  return (
    <button className={`button-${theme}`}>
      Themed Button
    </button>
  );
}

function App() {
  const [theme, setTheme] = createSignal('dark');
  
  return (
    <ThemeContext.Provider value={theme()}>
      <div className={`app theme-${theme()}`}>
        <ThemedButton />
        <button onClick={() => setTheme(theme() === 'light' ? 'dark' : 'light')}>
          Toggle Theme
        </button>
      </div>
    </ThemeContext.Provider>
  );
}
```

## Best Practices

- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use TypeScript for prop definitions
- Split large components into smaller ones
- Avoid deeply nested component trees
- Use keys for dynamic lists
- Memoize expensive computations
- Handle errors with error boundaries
- Test components in isolation

## Next Steps

- Learn about [Reactivity](reactivity.md) to understand how updates work
- Explore [Routing](routing.md) to build multi-page applications
- Check out [State Management](state.md) for handling application state
