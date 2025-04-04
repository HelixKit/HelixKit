# Getting Started with Helix-Kit

This guide will help you get up and running with Helix-Kit as quickly as possible.

## Installation

### Creating a New Project

The easiest way to get started with Helix-Kit is to create a new project using the CLI:

```bash
# Using npm
npm create helix-kit@latest my-app

# Using yarn
yarn create helix-kit my-app

# Using pnpm
pnpm create helix-kit my-app

# Using bun
bun create helix-kit my-app
```

This will scaffold a new Helix-Kit project with a recommended directory structure and configuration.

### Adding to an Existing Project

To add Helix-Kit to an existing project:

```bash
# Using npm
npm install helix-kit

# Using yarn
yarn add helix-kit

# Using pnpm
pnpm add helix-kit

# Using bun
bun add helix-kit
```

## Project Structure

A typical Helix-Kit project structure looks like this:

```plaintext
my-app/
   node_modules/
   public/              # Static assets
   src/
      components/      # Reusable components
         ...
      styles/          # CSS styles
         main.css
      App.tsx          # Root component
      index.tsx        # Entry point
   package.json
   tsconfig.json
```

## Your First Component

Create a simple component in a new file, e.g., `src/components/Counter.tsx`:

```tsx
import { h, createSignal } from 'helix-kit';

export default function Counter() {
  // Create a reactive signal with initial value 0
  const [count, setCount] = createSignal(0);
  
  // Increment count
  const increment = () => setCount(count() + 1);
  
  // Decrement count
  const decrement = () => setCount(count() - 1);
  
  return h('div', { className: 'counter' },
    h('h2', {}, 'Counter'),
    h('p', {}, `Current count: ${count()}`),
    h('div', { className: 'buttons' },
      h('button', { onClick: decrement }, '-'),
      h('button', { onClick: increment }, '+')
    )
  );
}
```

## Using JSX (Optional)

Helix-Kit supports JSX out of the box. To use JSX, configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

Then, update your Counter component using JSX:

```tsx
import { h, Fragment, createSignal } from 'helix-kit';

export default function Counter() {
  const [count, setCount] = createSignal(0);
  
  const increment = () => setCount(count() + 1);
  const decrement = () => setCount(count() - 1);
  
  return (
    <div className="counter">
      <h2>Counter</h2>
      <p>Current count: {count()}</p>
      <div className="buttons">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}
```

## Mounting Your App

In your entry file (`src/index.tsx`), mount your app to the DOM:

```tsx
import { h, render } from 'helix-kit';
import App from './App';

// Get the root element
const root = document.getElementById('app');

// Render the app
if (root) {
  render(h(App, {}), root);
}
```

## Development Server

Start the development server:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

# Using bun
bun run dev
```

The dev server has:

- Hot Module Replacement (HMR)
- Error overlay
- Fast refresh for components
- TypeScript error reporting

## Building for Production

Build your app for production:

```bash
# Using npm
npm run build

# Using yarn
yarn build

# Using pnpm
pnpm build

# Using bun
bun run build
```

This creates an optimized production build in the `dist` folder.

## Next Steps

Now that you have a basic Helix-Kit app running, check out:

- [Core Concepts](core-concepts.md) - Learn the fundamentals of Helix-Kit
- [Components](components.md) - Dive deeper into component creation
- [Reactivity](reactivity.md) - Learn about Helix-Kit's reactivity system
- [Examples](https://github.com/helixkit/helixkit/tree/main/examples) - Explore example projects

## Troubleshooting

### Common Issues

- **"Cannot find module 'helix-kit'"**: Make sure Helix-Kit is installed and `node_modules` is not in `.gitignore`.
- **JSX errors**: Ensure your `tsconfig.json` has the correct JSX configuration.
- **TypeScript errors**: Verify your TypeScript version is compatible (4.5+ recommended).

If you encounter other issues, check our [GitHub Issues](https://github.com/helixkit/helixkit/issues) or join our community [Discord server](https://discord.gg/helixkit).
