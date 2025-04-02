# State Management

Helix provides multiple approaches to state management, from local component state to application-wide stores. This guide explores the different options and when to use each one.

## Local Component State

For state that's only relevant to a single component, use the `createSignal` function:

```tsx
import { h, createSignal } from 'helix-kit';

function Counter() {
  // Local component state
  const [count, setCount] = createSignal(0);
  
  return h('div', {},
    h('p', {}, `Count: ${count()}`),
    h('button', { onClick: () => setCount(count() + 1) }, 'Increment')
  );
}
```

### When to Use Local State

- UI state (open/closed, active tab, hover state)
- Form input values
- Ephemeral data that doesn't need to be shared
- Small, self-contained components

## Prop Drilling

For sharing state between parent and child components, simply pass props down:

```tsx
import { h, createSignal } from 'helix-kit';

function Parent() {
  // State in parent component
  const [count, setCount] = createSignal(0);
  
  return h('div', {},
    h('h2', {}, 'Parent'),
    h('p', {}, `Count: ${count()}`),
    h('button', { onClick: () => setCount(count() + 1) }, 'Increment'),
    
    // Pass state and updater to child
    h(Child, { count, onIncrement: () => setCount(count() + 1) })
  );
}

function Child({ count, onIncrement }) {
  return h('div', { className: 'child' },
    h('h3', {}, 'Child'),
    h('p', {}, `Count from parent: ${count()}`),
    h('button', { onClick: onIncrement }, 'Increment from child')
  );
}
```

### When to Use Prop Drilling

- For shallow component trees
- When state only needs to be shared with direct children
- When the state flow is clear and direct

## Context API

For state that needs to be accessed by multiple components at different levels of the tree without prop drilling:

```tsx
import { h, createContext, createSignal } from 'helix-kit';

// Create a context with default values
const CounterContext = createContext({
  count: () => 0,
  increment: () => {},
  decrement: () => {}
});

// Provider component that holds the state
function CounterProvider(props) {
  const [count, setCount] = createSignal(0);
  
  const value = {
    count,
    increment: () => setCount(count() + 1),
    decrement: () => setCount(count() - 1)
  };
  
  return h(CounterContext.Provider, { value },
    props.children
  );
}

// Consumer component that uses the context
function Counter() {
  const { count, increment, decrement } = CounterContext.use();
  
  return h('div', {},
    h('p', {}, `Count: ${count()}`),
    h('button', { onClick: increment }, 'Increment'),
    h('button', { onClick: decrement }, 'Decrement')
  );
}

// App that provides the context
function App() {
  return h(CounterProvider, {},
    h('h1', {}, 'Counter App'),
    h(Counter, {}),
    h(Counter, {})  // Both counters share the same state
  );
}
```

### When to Use Context

- Theme data (dark/light mode)
- User authentication state
- Localization/i18n settings
- State needed by many components across the tree
- When prop drilling gets unwieldy

## Store API

For more complex application state, Helix-Kit provides a powerful store API:

```tsx
import { h, createStore } from 'helix-kit';

// Define the initial state
const initialState = {
  todos: [],
  filter: 'all',
  loading: false,
  error: null
};

// Create a store
const todoStore = createStore({
  name: 'todos',              // Optional name for debugging
  state: initialState,
  
  // Optional debug config
  debug: {
    enabled: true,            // Enable logging
    logActions: true          // Log actions to console
  }
});

// Component using the store
function TodoList() {
  const { getState, setState } = todoStore;
  
  // Add a new todo
  function addTodo(text) {
    const todos = getState('todos');
    setState('todos', [
      ...todos,
      { id: Date.now(), text, completed: false }
    ]);
  }
  
  // Toggle a todo's completed state
  function toggleTodo(id) {
    const todos = getState('todos');
    setState('todos', todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }
  
  // Load todos from API
  function loadTodos() {
    setState('loading', true);
    setState('error', null);
    
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        setState('todos', data);
        setState('loading', false);
      })
      .catch(err => {
        setState('error', err.message);
        setState('loading', false);
      });
  }
  
  return h('div', {},
    h('button', { onClick: loadTodos }, 'Load Todos'),
    getState('loading') && h('p', {}, 'Loading...'),
    getState('error') && h('p', { className: 'error' }, getState('error')),
    h('ul', {},
      getState('todos').map(todo =>
        h('li', { key: todo.id },
          h('input', {
            type: 'checkbox',
            checked: todo.completed,
            onChange: () => toggleTodo(todo.id)
          }),
          h('span', {
            style: { textDecoration: todo.completed ? 'line-through' : 'none' }
          }, todo.text)
        )
      )
    ),
    h('form', {
      onSubmit: (e) => {
        e.preventDefault();
        const input = e.target.elements.newTodo;
        addTodo(input.value);
        input.value = '';
      }
    },
      h('input', { name: 'newTodo', placeholder: 'Add a todo' }),
      h('button', { type: 'submit' }, 'Add')
    )
  );
}
```

### Store Features

#### Action Creators

For more structured state updates, use action creators:

```tsx
import { createStore } from 'helix-kit';

const todoStore = createStore({
  name: 'todos',
  state: {
    todos: [],
    filter: 'all'
  }
});

// Create reusable actions
const { createActions, getState, setState } = todoStore;

const actions = createActions((store) => ({
  // Add a new todo
  addTodo: (text) => {
    const todos = store.getState('todos');
    store.setState('todos', [
      ...todos,
      { id: Date.now(), text, completed: false }
    ]);
  },
  
  // Toggle a todo's completed state
  toggleTodo: (id) => {
    const todos = store.getState('todos');
    store.setState('todos', todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  },
  
  // Remove a todo
  removeTodo: (id) => {
    const todos = store.getState('todos');
    store.setState('todos', todos.filter(todo => todo.id !== id));
  },
  
  // Clear completed todos
  clearCompleted: () => {
    const todos = store.getState('todos');
    store.setState('todos', todos.filter(todo => !todo.completed));
  },
  
  // Set filter
  setFilter: (filter) => {
    store.setState('filter', filter);
  }
}));

// Use actions in components
function TodoApp() {
  return h('div', {},
    // ...other UI elements
    h('button', { onClick: () => actions.addTodo('New task') }, 'Add Task'),
    h('button', { onClick: actions.clearCompleted }, 'Clear Completed')
  );
}
```

#### Store Selectors

Create optimized derived state with selectors:

```tsx
const { createSelector, getState } = todoStore;

// Create a derived value
const filteredTodos = createSelector(
  () => getState('todos'),
  () => getState('filter'),
  (todos, filter) => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }
);

// Use the selector in a component
function FilteredTodoList() {
  return h('ul', {},
    filteredTodos().map(todo =>
      h('li', { key: todo.id }, todo.text)
    )
  );
}
```

#### Store Subscribers

Listen for state changes:

```tsx
const { subscribe } = todoStore;

// Subscribe to specific state changes
const unsubscribe = subscribe('todos', (newTodos, oldTodos) => {
  console.log('Todos changed:', { old: oldTodos, new: newTodos });
  
  // Save to localStorage
  localStorage.setItem('todos', JSON.stringify(newTodos));
});

// Unsubscribe when done
// unsubscribe();

// Subscribe to any state change
const unsubscribeAll = subscribe((newState, oldState) => {
  console.log('State changed:', { old: oldState, new: newState });
});
```

#### Store Plugins

Extend store functionality with plugins:

```tsx
import { createStore } from 'helix-kit';

// Local storage persistence plugin
function persistencePlugin(storageKey) {
  return (store) => {
    // Try to load initial state from localStorage
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        store.setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
    
    // Save to localStorage on changes
    store.subscribe((state) => {
      localStorage.setItem(storageKey, JSON.stringify(state));
    });
    
    return store;
  };
}

// Logger plugin
function loggerPlugin(options = {}) {
  return (store) => {
    const { logLevel = 'log', collapsed = false } = options;
    
    store.subscribe((newState, oldState, path) => {
      const logger = console[logLevel] || console.log;
      
      if (collapsed) {
        console.groupCollapsed(`Store Update: ${path || 'root'}`);
      } else {
        console.group(`Store Update: ${path || 'root'}`);
      }
      
      logger('Previous:', oldState);
      logger('Current:', newState);
      logger('Diff:', path, oldState !== newState 
        ? { from: oldState?.[path], to: newState?.[path] } 
        : 'No change');
      
      console.groupEnd();
    });
    
    return store;
  };
}

// Create store with plugins
const todoStore = createStore({
  name: 'todos',
  state: {
    todos: [],
    filter: 'all'
  },
  plugins: [
    persistencePlugin('todos-storage'),
    loggerPlugin({ collapsed: true, logLevel: 'debug' })
  ]
});
```

### When to Use Stores

- Complex application state
- Shared state across many components
- State that needs persistence
- When actions and logic become complex
- For better organization and scalability

## Custom Hooks

Encapsulate state logic in custom hooks for reusability:

```tsx
import { createSignal, createEffect } from 'helix-kit';

// Custom hook for local storage
function useLocalStorage(key, initialValue) {
  // Get stored value
  const storedValue = typeof window !== 'undefined' 
    ? localStorage.getItem(key) 
    : null;
  
  // Create a signal with the initial value
  const [value, setValue] = createSignal(
    storedValue ? JSON.parse(storedValue) : initialValue
  );
  
  // Update localStorage when value changes
  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(value()));
  });
  
  return [value, setValue];
}

// Custom hook for form fields
function useField(initialValue = '') {
  const [value, setValue] = createSignal(initialValue);
  const [touched, setTouched] = createSignal(false);
  const [error, setError] = createSignal('');
  
  const onChange = (e) => {
    setValue(e.target.value);
    if (touched()) {
      validate(e.target.value);
    }
  };
  
  const onBlur = (e) => {
    setTouched(true);
    validate(e.target.value);
  };
  
  const validate = (val) => {
    if (!val) {
      setError('Field is required');
    } else {
      setError('');
    }
  };
  
  return {
    value,
    error,
    touched,
    props: {
      value: value(),
      onInput: onChange,
      onBlur
    }
  };
}

// Usage
function ProfileForm() {
  const [username, setUsername] = useLocalStorage('username', '');
  const nameField = useField('');
  const emailField = useField('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nameField.error() && !emailField.error()) {
      // Submit the form...
      setUsername(nameField.value());
    }
  };
  
  return h('form', { onSubmit: handleSubmit },
    h('div', {},
      h('label', { htmlFor: 'name' }, 'Name'),
      h('input', { id: 'name', ...nameField.props }),
      nameField.error() && h('div', { className: 'error' }, nameField.error())
    ),
    h('div', {},
      h('label', { htmlFor: 'email' }, 'Email'),
      h('input', { id: 'email', type: 'email', ...emailField.props }),
      emailField.error() && h('div', { className: 'error' }, emailField.error())
    ),
    h('button', { type: 'submit' }, 'Save')
  );
}
```

### When to Use Custom Hooks

- Reusable logic across components
- Complex state interactions
- Form handling
- Data fetching patterns
- Animation logic
- Browser API interactions

## State Management Decision Tree

Use this decision tree to help choose the right approach:

1. **Is the state only used in one component?**
   - Yes � Use local component state (`createSignal`)
   - No � Continue

2. **Is the state only shared with direct children?**
   - Yes � Pass props down (prop drilling)
   - No � Continue

3. **Is the state needed by many components, but only in a specific subtree?**
   - Yes � Use Context API
   - No � Continue

4. **Is the state complex, application-wide, or need persistence?**
   - Yes � Use Store API
   - No � Reassess your needs

## Performance Considerations

### Optimizing Re-renders

1. **Keep state local**: Place state at the lowest common ancestor
2. **Use memos**: Cache derived values with `createMemo`
3. **Lazy initialization**: Initialize expensive state lazily
4. **Batch updates**: Group related state changes

```tsx
// Batch state updates
function updateUserProfile() {
  // Bad: Triggers three separate updates
  setUsername(newUsername);
  setEmail(newEmail);
  setAge(newAge);
  
  // Good: Update all at once using a store
  setState({
    username: newUsername,
    email: newEmail,
    age: newAge
  });
}
```

### Signal Granularity

Choose the right level of granularity for your signals:

```tsx
// Fine-grained signals
const [firstName, setFirstName] = createSignal('');
const [lastName, setLastName] = createSignal('');
const [email, setEmail] = createSignal('');

// Coarse-grained signal
const [formData, setFormData] = createSignal({
  firstName: '',
  lastName: '',
  email: ''
});

// Updater with fine-grained control
const updateFormField = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

## Server-Side Rendering Considerations

When using SSR, initialize your state on both the server and client:

```tsx
// Store that works with SSR
import { createStore } from 'helix';

// Detect environment
const isServer = typeof window === 'undefined';

// Create store with hydration
const todoStore = createStore({
  name: 'todos',
  state: isServer 
    ? initialServerState
    : window.__INITIAL_STATE__?.todos || initialClientState,
  
  // Other options...
});

// When rendering on the server
function renderApp() {
  const appHtml = renderToString(h(App, {}));
  
  // Serialize state for client
  const stateJson = JSON.stringify({
    todos: todoStore.getState()
  });
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <script>window.__INITIAL_STATE__ = ${stateJson};</script>
      </head>
      <body>
        <div id="app">${appHtml}</div>
        <script src="/app.js"></script>
      </body>
    </html>
  `;
}
```

## Next Steps

- Check out [Reactivity](reactivity.md) to understand how state updates work
- Learn about [Routing](routing.md) for building multi-page applications
- Explore [Server-Side Rendering](ssr.md) for improved SEO and performance
