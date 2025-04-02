# Compiler API Reference

This document provides detailed information about the compiler and build tooling in the Helix-Kit framework.

## Bundle API

### bundle

Bundles JavaScript/TypeScript application code into optimized output.

```typescript
function bundle(options: {
  entry: string | string[];
  outdir: string;
  format?: 'esm' | 'cjs' | 'iife';
  minify?: boolean;
  sourcemap?: boolean;
  target?: string[];
  external?: string[];
  define?: Record<string, string>;
  plugins?: Plugin[];
}): Promise<BundleResult>
```

**Parameters:**

- `options`: Bundle configuration options
  - `entry`: Entry point file(s)
  - `outdir`: Output directory
  - `format`: Output format (default: 'esm')
  - `minify`: Whether to minify output (default: true in production)
  - `sourcemap`: Whether to generate sourcemaps (default: true in development)
  - `target`: Target environments (default: ['es2020'])
  - `external`: Dependencies to exclude from bundle
  - `define`: Define global variables for the build
  - `plugins`: Additional plugins

**Returns:**

- Promise resolving to bundle result

**Example:**

```typescript
import { bundle } from 'helix-kit/compiler';

async function buildApp() {
  const result = await bundle({
    entry: 'src/index.tsx',
    outdir: 'dist',
    format: 'esm',
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    external: ['react', 'react-dom'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__VERSION__': JSON.stringify('1.0.0')
    }
  });
  
  console.log('Bundle complete:', result);
}
```

### BundleResult

Interface representing the result of a bundle operation.

```typescript
interface BundleResult {
  outputs: {
    path: string;
    size: number;
    originalSize: number;
    code: string;
  }[];
  duration: number;
  stats: {
    inputs: number;
    outputs: number;
    totalSize: number;
    compressionRatio: number;
  };
}
```

## Transform API

### transform

Transforms JavaScript/TypeScript code with various optimizations and features.

```typescript
function transform(options: {
  code: string;
  filename?: string;
  sourcemap?: boolean;
  jsx?: {
    factory?: string;
    fragment?: string;
    runtime?: 'automatic' | 'classic';
  };
  typescript?: boolean;
  stripTypes?: boolean;
  target?: string;
  minify?: boolean;
}): TransformResult
```

**Parameters:**

- `options`: Transform options
  - `code`: Source code to transform
  - `filename`: Optional filename for better error messages
  - `sourcemap`: Whether to generate sourcemaps
  - `jsx`: JSX configuration
  - `typescript`: Whether to process TypeScript
  - `stripTypes`: Whether to strip TypeScript types
  - `target`: ECMAScript target (e.g., 'es2020')
  - `minify`: Whether to minify the code

**Returns:**

- Transform result with code and optional sourcemap

**Example:**

```typescript
import { transform } from 'helix-kit/compiler';

// Transform JSX and TypeScript code
const code = `
  function Greeting({ name }: { name: string }) {
    return <h1>Hello, {name}!</h1>;
  }
`;

const result = transform({
  code,
  filename: 'greeting.tsx',
  sourcemap: true,
  jsx: {
    factory: 'h',
    fragment: 'Fragment',
    runtime: 'classic'
  },
  typescript: true,
  stripTypes: true,
  target: 'es2020'
});

console.log(result.code);
```

### TransformResult

Interface representing the result of a code transformation.

```typescript
interface TransformResult {
  code: string;
  map?: string | null;
  dependencies?: string[];
  warnings?: Array<{
    message: string;
    location?: {
      file: string;
      line: number;
      column: number;
    };
  }>;
}
```

## Optimize API

### optimize

Optimizes JavaScript code for production.

```typescript
function optimize(options: {
  code: string | Record<string, string>;
  minify?: boolean;
  mangle?: boolean;
  compress?: boolean;
  deadCode?: boolean;
  treeshake?: boolean;
  comments?: boolean | 'license';
  sourcemap?: boolean;
}): OptimizeResult
```

**Parameters:**

- `options`: Optimization options
  - `code`: Source code as string or object mapping filenames to content
  - `minify`: Whether to minify (default: true)
  - `mangle`: Whether to mangle variable names (default: true)
  - `compress`: Whether to apply compression optimizations (default: true)
  - `deadCode`: Whether to eliminate dead code (default: true)
  - `treeshake`: Whether to perform tree shaking (default: true)
  - `comments`: Whether to preserve comments (default: false)
  - `sourcemap`: Whether to generate sourcemaps (default: false)

**Returns:**

- Optimization result

**Example:**

```typescript
import { optimize } from 'helix-kit/compiler';

// Optimize a bundle
const code = `
  function unused() {
    console.log("This is never called");
  }
  
  function main() {
    console.log("Hello world");
  }
  
  main();
`;

const result = optimize({
  code,
  minify: true,
  deadCode: true,
  treeshake: true,
  comments: false
});

// Result.code will not include the unused function
console.log(result.code);
```

### OptimizeResult

Interface representing the result of code optimization.

```typescript
interface OptimizeResult {
  code: string;
  map?: string | null;
  size: {
    original: number;
    minified: number;
    gzipped?: number;
  };
  warnings?: string[];
}
```

## Plugin System

### Plugin

Interface for creating compiler plugins.

```typescript
interface Plugin {
  name: string;
  setup: (build: PluginBuild) => void | Promise<void>;
}
```

**Example:**

```typescript
import { bundle, Plugin } from 'helix-kit/compiler';

// Create a custom plugin
const loggerPlugin: Plugin = {
  name: 'logger',
  setup(build) {
    // Log at the start of each build
    build.onStart(() => {
      console.log('Build started:', new Date().toLocaleTimeString());
    });
    
    // Log when the build finishes
    build.onEnd(result => {
      console.log('Build finished:', new Date().toLocaleTimeString());
      console.log(`Generated ${result.outputs.length} files`);
    });
  }
};

// Use the plugin
bundle({
  entry: 'src/index.tsx',
  outdir: 'dist',
  plugins: [loggerPlugin]
});
```

### PluginBuild

Interface for plugin build hooks.

```typescript
interface PluginBuild {
  onStart(callback: () => void | Promise<void>): void;
  onEnd(callback: (result: BundleResult) => void | Promise<void>): void;
  onLoad(options: { 
    filter: RegExp, 
    namespace?: string 
  }, callback: (args: {
    path: string,
    namespace: string
  }) => Promise<{
    contents: string,
    loader?: string,
    resolveDir?: string
  }>): void;
  onResolve(options: { 
    filter: RegExp,
    namespace?: string
  }, callback: (args: {
    path: string,
    importer: string
  }) => Promise<{
    path: string,
    namespace?: string,
    external?: boolean
  }>): void;
  onTransform(options: {
    filter: RegExp,
    namespace?: string
  }, callback: (args: {
    path: string,
    contents: string
  }) => Promise<{
    contents: string
  }>): void;
}
```

## Asset Processing

### processAssets

Processes assets (images, styles, etc.) for inclusion in the build.

```typescript
function processAssets(options: {
  assets: Array<{
    source: string;
    destination?: string;
  }>;
  outdir: string;
  optimize?: boolean;
  hash?: boolean;
  manifest?: boolean;
}): Promise<AssetProcessingResult>
```

**Parameters:**

- `options`: Asset processing options
  - `assets`: Array of assets to process
  - `outdir`: Output directory
  - `optimize`: Whether to optimize assets (default: true in production)
  - `hash`: Whether to include content hash in filenames (default: true in production)
  - `manifest`: Whether to generate an asset manifest (default: true)

**Returns:**

- Promise resolving to asset processing result

**Example:**

```typescript
import { processAssets } from 'helix-kit/compiler';

// Process project assets
async function buildAssets() {
  const result = await processAssets({
    assets: [
      { source: 'src/assets/images/**/*', destination: 'images' },
      { source: 'src/styles/*.css', destination: 'styles' }
    ],
    outdir: 'dist',
    optimize: process.env.NODE_ENV === 'production',
    hash: true,
    manifest: true
  });
  
  console.log('Assets processed:', result.stats.total);
  console.log('Manifest:', result.manifest);
}
```

### AssetProcessingResult

Interface representing the result of asset processing.

```typescript
interface AssetProcessingResult {
  assets: Array<{
    source: string;
    destination: string;
    size: {
      original: number;
      processed: number;
    };
    type: string;
    hash?: string;
  }>;
  manifest?: Record<string, string>;
  stats: {
    total: number;
    byType: Record<string, number>;
    sizeReduction: number;
  };
}
```

## Type Checking

### typeCheck

Performs TypeScript type checking on project files.

```typescript
function typeCheck(options: {
  tsconfig?: string;
  files?: string[];
  strict?: boolean;
  emitDeclarations?: boolean;
  outDir?: string;
}): Promise<TypeCheckResult>
```

**Parameters:**

- `options`: Type checking options
  - `tsconfig`: Path to tsconfig.json (default: './tsconfig.json')
  - `files`: Files to check (default: all files in tsconfig)
  - `strict`: Whether to use strict type checking (default: from tsconfig)
  - `emitDeclarations`: Whether to emit declaration files (default: false)
  - `outDir`: Output directory for declarations (default: from tsconfig)

**Returns:**

- Promise resolving to type checking result

**Example:**

```typescript
import { typeCheck } from 'helix-kit/compiler';

// Type check project files
async function checkTypes() {
  const result = await typeCheck({
    tsconfig: './tsconfig.json',
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    strict: true,
    emitDeclarations: true,
    outDir: 'dist/types'
  });
  
  if (result.errors.length) {
    console.error(`Found ${result.errors.length} type errors`);
    result.errors.forEach(error => {
      console.error(`${error.file}:${error.line} - ${error.message}`);
    });
    process.exit(1);
  } else {
    console.log('No type errors found');
  }
}
```

### TypeCheckResult

Interface representing the result of type checking.

```typescript
interface TypeCheckResult {
  errors: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
    severity: 'warning';
  }>;
  stats: {
    files: number;
    declarations?: number;
    errors: number;
    warnings: number;
  };
  elapsed: number;
}
```

## Build Cache

### getCacheInfo

Gets information about the current build cache.

```typescript
function getCacheInfo(): CacheInfo
```

**Returns:**

- Object with cache information

**Example:**

```typescript
import { getCacheInfo, clearCache } from 'helix-kit/compiler';

// Check cache status and clear if too large
function manageBuildCache() {
  const cache = getCacheInfo();
  
  console.log(`Cache size: ${(cache.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Cache entries: ${cache.entries}`);
  console.log(`Last used: ${cache.lastUsed}`);
  
  if (cache.size > 500 * 1024 * 1024) {
    console.log('Cache too large, clearing...');
    clearCache();
  }
}
```

### clearCache

Clears the build cache.

```typescript
function clearCache(): void
```

### CacheInfo

Interface representing build cache information.

```typescript
interface CacheInfo {
  size: number;
  entries: number;
  lastUsed: Date;
  directory: string;
}
```
