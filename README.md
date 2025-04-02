# Helix-Kit

Helix-Kit is a lightweight, high-performance JavaScript framework for building modern web applications. It leverages fine-grained reactivity inspired by SolidJS, combined with an efficient virtual DOM implementation.

## Features

- 🚀 **Fine-grained reactivity** - Only re-render what has changed
- 🔄 **Efficient rendering** - Optimized virtual DOM with intelligent diffing
- ⚡ **Task scheduling** - Prioritize UI updates for better responsiveness
- 🖥️ **Server-side rendering** - With streaming and progressive hydration
- 📦 **Small bundle size** - Lightweight with no heavy dependencies
- 🧩 **Component-based** - Intuitive component architecture
- 💪 **TypeScript-first** - Built with type safety in mind
- 🔌 **Extensible** - Easily integrate with other libraries

## Installation

```bash
# Create a new project
npx helix-kit create my-app

# Or with TypeScript
npx helix-kit create my-app --ts

# For SSR applications
npx helix-kit create my-ssr-app --template ssr
```

Or add to an existing project:

```bash
bun add helix-kit
```

## Basic Example

```jsx
import { h, render, createSignal } from 'helix-kit';

function Counter() {
  const [count, setCount] = createSignal(0);
  
  return h('div', {},
    h('h1', {}, `Count: ${count()}`),
    h('button', { 
      onClick: () => setCount(count() + 1) 
    }, 'Increment')
  );
}

render(h(Counter), document.getElementById('app'));
```

## Documentation

Visit our documentation for comprehensive guides and API references:

- [Getting Started](./docs/getting-started.md)
- [Core Concepts](./docs/core-concepts.md)
- [Reactivity](./docs/reactivity.md)
- [Components](./docs/components.md)
- [Server-Side Rendering](./docs/ssr.md)

## Examples

Explore our example applications for reference implementations:

- [Todo App](./examples/todo-app)
- [E-commerce](./examples/e-commerce)
- [Blog](./examples/blog)

## Roadmap

### Q2 2025

- **Suspense improvements**
  - [ ] Enhanced error handling for suspended components
  - [ ] Better integration with data fetching libraries
  - [ ] Custom fallback timeout configuration

- **Developer Experience**
  - [ ] Hot Module Replacement optimizations
  - [ ] Improved debugging experience with devtools integration
  - [ ] Better error messages and warnings
  
- **Performance**
  - [ ] Compiler optimizations for static content
  - [ ] Reduced runtime overhead
  - [ ] Bundle size optimization

### Q3 2025

- **Server Components**
  - [ ] True server components (run only on server)
  - [ ] Seamless client/server boundary integration
  - [ ] Automatic data serialization
  
- **Data Management**
  - [ ] Built-in caching layer
  - [ ] Advanced store capabilities with middleware
  - [ ] Time-travel debugging for stores
  
- **Build System**
  - [ ] Faster compilation
  - [ ] Improved tree-shaking
  - [ ] Multi-target builds (modern/legacy)

### Q4 2025

- **Ecosystem**
  - [ ] Router improvements with nested layouts
  - [ ] Form handling utilities
  - [ ] Animation libraries
  
- **Mobile & Desktop**
  - [ ] React Native integration
  - [ ] Electron support
  - [ ] Web Components export
  
- **Enterprise Features**
  - [ ] Internationalization (i18n) utilities
  - [ ] Advanced accessibility tooling
  - [ ] Performance monitoring

### Long-term Vision

- **Compiler-focused optimizations**
  - [ ] AOT compilation for runtime performance
  - [ ] Partial hydration at component level
  - [ ] Zero-runtime CSS integration
  
- **Edge Computing**
  - [ ] Edge SSR optimization
  - [ ] Efficient streaming on edge functions
  - [ ] Edge-specific data caching

- **AI Integration**
  - [ ] Automatic component optimization suggestions
  - [ ] Runtime performance analysis
  - [ ] Smart prefetching
  
## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/helixkit/helixkit/blob/main/CONTRIBUTING.md) for details.

## License

MIT
