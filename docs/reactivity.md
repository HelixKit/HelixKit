# Reactivity

Helix's reactivity system is the heart of the framework, allowing your UI to automatically update when state changes. This page explains how reactivity works and how to use the various reactive primitives.

## Core Concepts

### Fine-grained Reactivity

Helix uses a fine-grained reactivity system, which means:

- Only the specific components that depend on changed state update
- Updates are precise and efficient
- The system tracks dependencies automatically

### Reactive Primitives

Helix provides several reactive primitives:

1. **Signals**: Core units of reactive state
2. **Effects**: Side effects that run when dependencies change
3. **Memos**: Derived values that cache and update automatically
4. **Resources**: Containers for async data with loading states

## Signals

Signals are the basic building blocks of reactivity in Helix. A signal:

- Holds a piece of state
- Provides a getter function to read the value
- Provides a setter function to update the value
- Notifies dependents when the value changes

### Creating Signals

```tsx
import { createSignal } from 'helix-kit';

// Create a signal with initial value
const [count, setCount] = createSignal(0);

// Read the value
console.log(count()); // 0

// Update the value
setCount(1);
console.log(count()); // 1

// Update based on previous value
setCount(prev => prev + 1);
console.log(count()); // 2
```

### Using Signals in Components

```tsx
import { h, createSignal } from 'helix-kit';

function Counter() {
  const [count, setCount] = createSignal(0);
  
  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

### Signal Batching

When multiple signals update in the same event handler or task, Helix batches the updates for efficiency:

```tsx
import { createSignal, createEffect } from 'helix-kit';

const [first, setFirst] = createSignal('John');
const [last, setLast] = createSignal('Doe');

createEffect(() => {
  console.log(`Name: ${first()} ${last()}`);
});

// This will only trigger the effect once, not twice
function updateName() {
  setFirst('Jane');
  setLast('Smith');
}
```

## Effects

Effects are functions that run when their dependencies change. Use effects for side effects like:

- DOM manipulations
- Fetching data
- Setting up subscriptions
- Logging
- Synchronizing with external systems

### Creating Effects

```tsx
import { createSignal, createEffect } from 'helix-kit';

const [count, setCount] = createSignal(0);

// Effect automatically tracks dependencies
createEffect(() => {
  console.log(`Count changed to ${count()}`);
  
  // Return a cleanup function (optional)
  return () => {
    console.log('Cleaning up previous effect');
  };
});

// This will trigger the effect
setCount(1);
```

### Dependency Tracking

Effects automatically track any signals accessed during execution:

```tsx
import { createSignal, createEffect } from 'helix-kit';

const [a, setA] = createSignal(1);
const [b, setB] = createSignal(2);

createEffect(() => {
  if (a() > 0) {
    console.log(`a: ${a()}, b: ${b()}`);
  } else {
    console.log(`a is not positive: ${a()}`);
    // b is not accessed in this branch
  }
});

// Triggers effect - both a and b are dependencies
setA(5);
setB(10);

// Triggers effect - a changes, causing b to no longer be a dependency
setA(-1);

// Does NOT trigger effect - b is no longer a dependency
setB(20);
```

## Memos

Memos are cached derived values that update only when their dependencies change:

```tsx
import { createSignal, createMemo } from 'helix-kit';

const [firstName, setFirstName] = createSignal('John');
const [lastName, setLastName] = createSignal('Doe');

// Create a derived value
const fullName = createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"

setFirstName('Jane');
console.log(fullName()); // "Jane Doe"
```

### Memos vs. Effects

- Memos are for computing values; effects are for side effects
- Memos return values; effects don't
- Memos cache their result; effects don't
- Both track dependencies automatically

### Using Memos for Performance

Memos help avoid expensive recalculations:

```tsx
import { h, createSignal, createMemo } from 'helix-kit';

function FilteredList({ items }) {
  const [filter, setFilter] = createSignal('');
  
  // This calculation only runs when items or filter changes
  const filteredItems = createMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter().toLowerCase())
    );
  });
  
  return (
    <div>
      <input 
        type="text" 
        value={filter()} 
        onInput={(e) => setFilter(e.target.value)} 
        placeholder="Filter items..."
      />
      <ul>
        {filteredItems().map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Resources

Resources handle async data fetching with built-in loading and error states:

```tsx
import { h, createResource, Suspense } from 'helix-kit';

// Async data fetcher
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

function UserProfile({ userId }) {
  // Create a resource
  const [user, { loading, error }] = createResource(
    () => userId, // Source function
    fetchUserData  // Fetcher function
  );
  
  return (
    <div className="user-profile">
      {error() && <div className="error">{error().message}</div>}
      {loading() ? (
        <div className="loading">Loading user data...</div>
      ) : (
        <div className="user-data">
          <h2>{user()?.name}</h2>
          <p>Email: {user()?.email}</p>
        </div>
      )}
    </div>
  );
}

// Using with Suspense
function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userId="123" />
    </Suspense>
  );
}
```

### Resource Features

- Automatic refetching when dependencies change
- Loading state management
- Error handling
- Caching of results
- Integration with Suspense

## Context

Context provides a way to share reactive state across components without prop drilling:

```tsx
import { h, createContext, createSignal } from 'helix-kit';

// Create context with a default value
const CounterContext = createContext({
  count: () => 0,
  increment: () => {},
  decrement: () => {}
});

// Provider component
function CounterProvider(props) {
  const [count, setCount] = createSignal(0);
  
  const value = {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1)
  };
  
  return (
    <CounterContext.Provider value={value}>
      {props.children}
    </CounterContext.Provider>
  );
}

// Consumer component
function Counter() {
  // Use the context
  const { count, increment, decrement } = CounterContext.use();
  
  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// App with context
function App() {
  return (
    <CounterProvider>
      <h1>Counter App</h1>
      <Counter />
      <Counter />
    </CounterProvider>
  );
}
```

## Advanced Patterns

### Custom Reactive Primitives

You can create custom reactive hooks by composing the built-in primitives:

```tsx
import { createSignal, createEffect } from 'helix-kit';

// Custom hook for local storage
function createLocalStorage(key, initialValue) {
  // Create a signal with the stored or initial value
  const storedValue = localStorage.getItem(key);
  const [value, setValue] = createSignal(
    storedValue ? JSON.parse(storedValue) : initialValue
  );
  
  // Sync with localStorage when the value changes
  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(value()));
  });
  
  return [value, setValue];
}

// Usage
function App() {
  const [name, setName] = createLocalStorage('userName', '');
  
  return (
    <div>
      <input 
        value={name()} 
        onInput={(e) => setName(e.target.value)} 
        placeholder="Your name"
      />
      <p>Hello, {name() || 'Guest'}!</p>
    </div>
  );
}
```

### Derived Signals

You can create a writable derived signal:

```tsx
import { createSignal, createEffect } from 'helix-kit';

// Temperature converter
function createTemperatureConverter() {
  const [celsius, setCelsius] = createSignal(0);
  const [fahrenheit, setFahrenheit] = createSignal(32);
  
  // Keep fahrenheit in sync with celsius
  createEffect(() => {
    setFahrenheit((celsius() * 9/5) + 32);
  });
  
  // Keep celsius in sync with fahrenheit
  createEffect(() => {
    setCelsius((fahrenheit() - 32) * 5/9);
  });
  
  return {
    celsius: [
      celsius,
      (value) => {
        setCelsius(value);
      }
    ],
    fahrenheit: [
      fahrenheit,
      (value) => {
        setFahrenheit(value);
      }
    ]
  };
}
```

## Performance Optimization

### Scheduling Priorities

Helix's scheduler assigns different priorities to updates:

```tsx
import { scheduleTask, Priority } from 'helix-kit';

// High priority task (e.g., user input)
scheduleTask(() => {
  // Update UI in response to user interaction
}, Priority.HIGH);

// Low priority task (e.g., analytics)
scheduleTask(() => {
  // Send analytics data
}, Priority.LOW);
```

### After Paint

Schedule work to happen after the browser has painted:

```tsx
import { afterPaint } from 'helix-kit';

function handleClick() {
  // Update UI state immediately
  setIsOpen(true);
  
  // Measure element after paint
  afterPaint(() => {
    const height = element.getBoundingClientRect().height;
    console.log('Element height after opening:', height);
  });
}
```

## Best Practices

1. **Keep signals at the right level**: Place signals at the component level where they're needed
2. **Use memos for expensive calculations**: Avoid recalculating in render functions
3. **Watch for signal updates in loops**: Be careful with signal updates in loops to avoid infinite loops
4. **Clean up side effects**: Return cleanup functions from effects
5. **Avoid deep nesting**: Keep your reactive dependencies shallow for better performance
6. **Use batch updates**: Group related signal updates

## Next Steps

- Learn about [State Management](state.md) for handling application-wide state
- Explore [Components](components.md) to see how reactivity integrates with UI
- Check out [Server-Side Rendering](ssr.md) to understand how reactivity works with SSR
