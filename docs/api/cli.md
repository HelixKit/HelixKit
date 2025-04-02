# CLI API Reference

This document provides detailed information about the Command Line Interface (CLI) in the Helix-Kit framework.

## Command Overview

Helix-Kit provides a CLI for common development tasks. The CLI is available after installing the framework:

```bash
# Install globally
npm install -g helix-kit

# Or use with npx
npx helix-kit [command]

# Or use via package.json scripts
# "scripts": {
#   "dev": "helix-kit dev",
#   "build": "helix-kit build"
# }
```

The CLI includes the following main commands:

| Command | Description |
|---------|-------------|
| `create` | Creates a new Helix-Kit project |
| `dev` | Starts the development server |
| `build` | Builds the application for production |
| `generate` | Generates components, files, and configuration |

## Create Command

### helix-kit create

Creates a new Helix-Kit project.

```bash
helix-kit create [project-name] [options]
```

**Arguments:**

- `project-name`: Name of the project directory

**Options:**

- `-t, --template <name>`: Template to use (default: 'basic')
- `--ts, --typescript`: Use TypeScript (default: true)
- `--jsx`: Use JSX syntax (default: true)
- `--ssr`: Enable server-side rendering
- `--git`: Initialize a Git repository (default: true)
- `--install`: Install dependencies (default: true)
- `--pm <manager>`: Package manager to use ('npm', 'yarn', 'pnpm', or 'bun')
- `--skip-prompts`: Skip all prompts and use defaults

**Examples:**

```bash
# Create a new project with interactive prompts
helix-kit create my-app

# Create a basic project with all defaults
helix-kit create my-app --skip-prompts

# Create an SSR project
helix-kit create my-ssr-app --template ssr --ssr

# Create a project with specific options
helix-kit create my-app --template basic --ts --no-git --pm pnpm
```

### Available Templates

The `create` command supports the following templates:

| Template | Description |
|----------|-------------|
| `basic` | Basic client-side application |
| `ssr` | Application with server-side rendering |
| `spa` | Single-page application with routing |
| `api` | Full-stack application with API |
| `minimal` | Minimal setup with no additional features |

## Development Command

### helix-kit dev

Starts the development server.

```bash
helix-kit dev [options]
```

**Options:**

- `-p, --port <port>`: Port to run the dev server on (default: 3000)
- `-h, --host <host>`: Host to run the dev server on (default: localhost)
- `--https`: Use HTTPS
- `--open`: Open browser automatically
- `--no-hmr`: Disable Hot Module Replacement
- `--ssr`: Enable server-side rendering mode
- `--config <path>`: Path to config file
- `--target <target>`: Deployment target ('node' or 'browser')

**Examples:**

```bash
# Start dev server on default port
helix-kit dev

# Start dev server on specific port
helix-kit dev --port 4000

# Start dev server with SSR enabled
helix-kit dev --ssr

# Start dev server with specific config
helix-kit dev --config ./dev.config.js --open
```

### Development Server Features

The development server provides:

- Hot Module Replacement (HMR)
- Error overlay for runtime errors
- Fast refresh for components
- Source maps for debugging
- TypeScript error reporting in real-time
- Proxy for API requests
- Asset serving
- Environment variable injection

## Build Command

### helix-kit build

Builds the application for production.

```bash
helix-kit build [options]
```

**Options:**

- `--out <dir>`: Output directory (default: 'dist')
- `--target <target>`: Build target ('node' or 'browser')
- `--ssr`: Enable server-side rendering build
- `--analyze`: Analyze bundle size
- `--minify`: Minify output (default: true)
- `--sourcemap`: Generate source maps (default: false in production)
- `--config <path>`: Path to config file
- `--experimental-vm`: Use experimental VM module for faster builds

**Examples:**

```bash
# Standard production build
helix-kit build

# Build with SSR
helix-kit build --ssr

# Build with bundle analysis
helix-kit build --analyze

# Build with custom output directory
helix-kit build --out ./public

# Build with source maps
helix-kit build --sourcemap
```

### Build Output

The build command generates:

- Optimized JavaScript bundles
- CSS with vendor prefixes and minification
- Asset optimization (images, fonts, etc.)
- Type definitions (if using TypeScript)
- Server bundles (if using SSR)
- Service worker (if enabled)

## Generate Command

### helix-kit generate

Generates components, files, and configuration.

```bash
helix-kit generate [type] [name] [options]
```

**Arguments:**

- `type`: Type of file to generate ('component', 'page', 'store', 'api', etc.)
- `name`: Name of the item to generate

**Options:**

- `--dir <directory>`: Directory to create the file in
- `--ts, --typescript`: Use TypeScript (auto-detected from project)
- `--jsx`: Use JSX syntax (auto-detected from project)
- `--force`: Overwrite existing files
- `--dry-run`: Show what would be generated without writing files
- `--template <template>`: Custom template to use

**Examples:**

```bash
# Generate a component
helix-kit generate component Button

# Generate a page
helix-kit generate page About --dir src/pages

# Generate a store
helix-kit generate store UserStore --ts

# Generate an API endpoint
helix-kit generate api users --dir src/api

# Preview generation without writing files
helix-kit generate component Modal --dry-run
```

### Generation Types

The `generate` command supports creating the following types:

| Type | Description |
|------|-------------|
| `component` | UI component |
| `page` | Page component with routing |
| `store` | State management store |
| `api` | API endpoint (for SSR/API projects) |
| `hook` | Custom hook |
| `util` | Utility function |
| `test` | Test file |
| `config` | Configuration file |

## Project Structure

The CLI commands work with a standard project structure:

```bash
my-app/
  node_modules/
  public/              # Static assets served as-is
  src/
    components/      # Reusable UI components
    pages/           # Page components
    stores/          # State management
    hooks/           # Custom hooks
    utils/           # Utility functions
    styles/          # Global styles
    types/           # TypeScript type definitions
    App.tsx          # Root component
    index.tsx        # Entry point
  server/              # Server-side code (for SSR)
  helix.config.js      # Framework configuration
  package.json
  tsconfig.json        # TypeScript configuration
```

## Configuration

### Configuration File

Helix-Kit can be configured using a `helix.config.js` (or `.ts`) file:

```javascript
// helix.config.js
module.exports = {
  // Core settings
  input: 'src/index.tsx',      // Entry point
  outDir: 'dist',              // Output directory
  publicDir: 'public',         // Static files directory
  
  // Development server
  server: {
    port: 3000,
    host: 'localhost',
    https: false,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  
  // Build options
  build: {
    target: 'browser',         // 'browser' or 'node'
    minify: true,
    sourcemap: false,
    splitting: true,           // Code splitting
    ssr: false,                // Server-side rendering
    formats: ['esm', 'cjs'],   // Output formats
    polyfills: true            // Add polyfills
  },
  
  // Framework features
  features: {
    jsx: true,                 // JSX support
    typescript: true,          // TypeScript support
    router: true,              // Router support
    store: true,               // State management
  },
  
  // Plugins
  plugins: [
    // Additional plugins
  ]
};
```

### Command Line Interface API

Advanced users can use the CLI API in JavaScript:

```javascript
// build-script.js
const { build, createDevServer } = require('helix-kit/cli');

async function runBuild() {
  const result = await build({
    input: 'src/index.tsx',
    outDir: 'dist',
    minify: true,
    sourcemap: true
  });
  
  console.log(`Built ${result.inputs.length} files`);
  console.log(`Output: ${result.size.pretty}`);
}

async function startDev() {
  const server = await createDevServer({
    port: 3000,
    open: true
  });
  
  server.on('request', (req, res) => {
    console.log(`${req.method} ${req.url}`);
  });
  
  // Stop server when needed
  // server.close();
}

// Run the selected function
const mode = process.argv[2];
if (mode === 'dev') {
  startDev();
} else {
  runBuild();
}
```

## Plugin System

### CLI Plugins

Extend the CLI with plugins:

```javascript
// my-plugin.js
module.exports = {
  name: 'my-plugin',
  setup(api) {
    // Add CLI commands
    api.registerCommand('audit', async (args) => {
      // Implement command
      console.log('Running audit...');
    });
    
    // Hook into build lifecycle
    api.hooks.beforeBuild.tap(config => {
      console.log('Preparing build...');
      return config;
    });
    
    api.hooks.afterBuild.tap(result => {
      console.log('Build complete!');
      return result;
    });
  }
};

// helix.config.js
module.exports = {
  // ...other config
  plugins: [
    require('./my-plugin')
  ]
};
```

## Environment Variables

The CLI automatically loads environment variables from `.env` files:

- `.env`: Loaded in all environments
- `.env.local`: Loaded in all environments, ignored by Git
- `.env.development`: Loaded in development
- `.env.production`: Loaded in production
- `.env.test`: Loaded in test environment

Environment variables are accessible in your code via `process.env` (Node.js) or `import.meta.env` (browser).

## API Functions

### Build API

```typescript
function build(options?: {
  input?: string;
  outDir?: string;
  minify?: boolean;
  sourcemap?: boolean;
  target?: 'browser' | 'node';
  ssr?: boolean;
  analyze?: boolean;
  verbose?: boolean;
  config?: string;
}): Promise<BuildResult>
```

### Dev Server API

```typescript
function createDevServer(options?: {
  port?: number;
  host?: string;
  https?: boolean;
  open?: boolean;
  hmr?: boolean;
  ssr?: boolean;
  config?: string;
}): Promise<DevServer>
```

### Generator API

```typescript
function generate(options: {
  type: string;
  name: string;
  directory?: string;
  typescript?: boolean;
  jsx?: boolean;
  force?: boolean;
  dryRun?: boolean;
  template?: string;
}): Promise<GenerateResult>
```

## Error Handling

The CLI includes robust error handling:

- Syntax errors are displayed with code frames
- Runtime errors show stack traces
- TypeScript errors show detailed type information
- Build errors include suggestions for fixes
- Network errors provide troubleshooting steps

Example error output:

```bash
ERROR in src/components/Button.tsx:25:10

TS2551: Property 'colour' does not exist on type 'ButtonProps'. Did you mean 'color'?

  23 | function Button(props: ButtonProps) {
  24 |   return (
> 25 |     <button colour={props.color} className="btn">
     |             ^^^^^^
  26 |       {props.children}
  27 |     </button>
  28 |   );

Suggested fix: Change 'colour' to 'color'
```
