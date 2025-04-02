# Helix-Kit Framework

> A lightweight, high-performance JavaScript/TypeScript framework built for modern web applications.

## Overview

Helix-Kit is a modern reactive framework designed to be fast, flexible, and developer-friendly. It focuses on performance, simplicity, and developer experience without sacrificing features.

## Key Features

- **Lightweight**: Small bundle size with minimal dependencies
- **High Performance**: Fine-grained reactivity and efficient DOM updates
- **TypeScript First**: Built with and optimized for TypeScript
- **Server-Side Rendering**: Built-in SSR with streaming and Suspense support
- **Component-Based**: Intuitive component model with composition
- **Flexible State Management**: Simple but powerful state management solutions
- **Developer Experience**: Helpful error messages and debugging tools

## Getting Started

To start building with Helix-Kit, check out the [Getting Started](getting-started.md) guide.

```bash
# Create a new project
npm create helix-kit@latest my-app

# Or with Bun
bun create helix-kit my-app
```

## Example

Here's a simple counter component in Helix-Kit:

```tsx
import { h, createSignal, createEffect } from 'helix-kit';

function Counter() {
  // Create a reactive signal
  const [count, setCount] = createSignal(0);
  // Create a derived state
  const [doubleCount, setDoubleCount] = createSignal(0);
  
  // Effect runs when dependencies change
  createEffect(() => {
    setDoubleCount(count() * 2);
  });
  
  return h('div', { className: 'counter' },
    h('p', {}, `Count: ${count()}`),
    h('p', {}, `Double: ${doubleCount()}`),
    h('button', { 
      onClick: () => setCount(count() + 1) 
    }, 'Increment')
  );
}
```

## Core Concepts

- [Core Concepts](core-concepts.md)
- [Components](components.md)
- [Reactivity](reactivity.md)
- [Routing](routing.md)
- [State Management](state.md)
- [Server-Side Rendering](ssr.md)

## API Reference

- [Core API](api/core.md)
- [Compiler API](api/compiler.md)
- [SSR API](api/ssr.md)
- [CLI Commands](api/cli.md)

## Browser Support

Helix-Kit supports all modern browsers, including:

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Opera (last 2 versions)

## License

Helix-Kit is [MIT licensed](https://github.com/helixkit/helixkit/blob/main/LICENSE).
