# Helix-Kit SSR Template

This is a Server-Side Rendering (SSR) template for creating Helix-Kit applications. This template provides a foundation for building isomorphic applications that render on both the server and client.

## Features

- 🖥️ Server-side rendering
- 🔄 Client-side hydration
- 📊 Data fetching with Suspense
- 🌊 Streaming SSR capabilities
- 📱 Progressive enhancement
- 🚀 Fast development with Bun

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Run the production server
bun start
```

## Structure

- `src/` - Application source code
  - `components/` - Reusable UI components
  - `styles/` - CSS stylesheets
  - `App.tsx` - Main application component
  - `index.tsx` - Client-side entry point
- `server/` - Server-side rendering code
  - `index.ts` - Server entry point
- `public/` - Static assets
- `dist/` - Build output (generated)

## Server-Side Rendering

This template demonstrates:

1. Server-side rendering of React components
2. Hydration on the client side
3. Sharing data between server and client
4. Progressive enhancement
5. Suspense for async data loading

## Documentation

For more information on using Helix-Kit SSR, please refer to:

- [SSR Guide](https://github.com/your-org/helix-kit/docs/ssr.md)
- [API Reference](https://github.com/your-org/helix-kit/docs/api/ssr.md)
- [Examples](https://github.com/your-org/helix-kit/examples/ssr/)

## License

MIT
