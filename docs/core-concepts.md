# Core Concepts

Helix is built on a few fundamental concepts that are important to understand as you build applications. This guide introduces these core concepts and explains how they work together.

## Reactive Programming

At its core, Helix is built around reactive programming principles. Reactive programming is a paradigm that deals with data streams and the propagation of changes. Helix implements this through a fine-grained reactivity system that tracks dependencies and automatically updates the UI when data changes.

### Key Reactive Principles in Helix

1. **Signals**: Small, independent units of reactive state
2. **Effects**: Side effects that automatically run when dependencies change
3. **Memos**: Cached computed values that update only when dependencies change
4. **Resources**: Reactive containers for async data

## Component Model

Components are the building blocks of Helix applications. Each component encapsulates:

- **UI Structure**: How the component renders to the DOM
- **Local State**: Internal data the component manages
- **Lifecycle**: When the component mounts, updates, and unmounts
- **Event Handlers**: How the component responds to user interactions

### Function Components

Helix uses a functional component model. Components are JavaScript functions that:

1. Accept props as input
2. Return elements that describe what should appear on the screen
3. Can create and manage local reactive state
4. Track dependencies and re-render efficiently when state changes

Example:

```tsx
function Greeting({ name }) {
  // Local reactive state
  const [count, setCount] = createSignal(0);
  
  // Effect runs when dependencies change
  createEffect(() => {
    console.log(`${name} has been greeted ${count()} times`);
  });
  
  return h('div', {},
    h('h1', {}, `Hello, ${name}!`),
    h('p', {}, `Greeted ${count()} times`),
    h('button', { 
      onClick: () => setCount(count() + 1) 
    }, 'Greet')
  );
}
```

## Rendering Model

Helix uses a virtual DOM approach with optimizations:

1. **Component Functions**: Create a virtual representation of the UI
2. **Virtual DOM**: A lightweight JavaScript representation of the real DOM
3. **Diffing Algorithm**: Efficiently determines the changes needed
4. **Batched Updates**: Groups DOM operations for better performance
5. **Incremental Rendering**: Updates only what needs to change

### Rendering Lifecycle

1. **Mount**: Component functions run, creating a virtual DOM tree
2. **Commit**: The virtual DOM is translated to actual DOM operations
3. **Reactive Updates**: When signals change, affected components update
4. **Unmount**: Components are removed and cleanup functions run

## One-way Data Flow

Helix follows a one-way data flow model:

1. **State**: Data flows down from parent to child via props
2. **Events**: Children communicate up to parents via callbacks
3. **Store**: Global state can be accessed by any component

This model makes applications more predictable and easier to debug.

## Scheduler and Priority

Helix includes a task scheduler that:

1. **Prioritizes Updates**: Critical UI updates happen first
2. **Batches Related Changes**: For better performance
3. **Manages Concurrency**: Ensuring smooth user experience
4. **Prevents UI Blocking**: By yielding to the main thread

## Error Handling

Helix provides mechanisms for graceful error handling:

1. **Error Boundaries**: Components that catch errors in their subtree
2. **Fallbacks**: Alternative UI to show when errors occur
3. **Recovery Mechanisms**: Ways to retry or reset after errors

## Suspense and Lazy Loading

To improve performance and user experience, Helix includes:

1. **Suspense**: A way to show loading states while async operations resolve
2. **Lazy Loading**: Defer loading components until they're needed
3. **Code Splitting**: Break your app into smaller chunks

## Progressive Enhancement and SSR

Helix supports server-side rendering with:

1. **Isomorphic Rendering**: Same components on server and client
2. **Hydration**: Attaching event listeners to server-rendered HTML
3. **Streaming**: Sending HTML progressively as it renders

## Next Steps

Now that you understand Helix's core concepts, dive deeper into:

- [Components](components.md): Learn how to create and compose components
- [Reactivity](reactivity.md): Explore the reactivity system in depth
- [State Management](state.md): See how to manage application state
- [Server-Side Rendering](ssr.md): Learn about SSR capabilities
