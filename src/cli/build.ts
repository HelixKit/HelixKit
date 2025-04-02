/**
 * Production build for Helix
 */

import fs from 'node:fs';
import path from 'node:path';
import { bundleApp } from '../compiler/bundle';
import type { Command } from 'commander';

/**
 * Registers the build command
 */
export function buildCommand(program: Command): void {
  program
    .command('build')
    .description('Build for production')
    .option('-o, --out <dir>', 'Output directory', 'dist')
    .option('--no-minify', 'Disable minification')
    .option('--target <target>', 'Target environment', 'es2020')
    .option('--sourcemap', 'Generate source maps')
    .option('--ssr', 'Enable server-side rendering')
    .action(async options => {
      try {
        await buildProject(options);
      } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
      }
    });
}

/**
 * Builds a Helix project for production
 */
export async function buildProject(options: {
  out: string;
  minify: boolean;
  target: string;
  sourcemap: boolean;
  ssr: boolean;
}): Promise<void> {
  const {
    out = 'dist',
    minify = true,
    target = 'es2020',
    sourcemap = false,
    ssr = false,
  } = options;

  console.log('Building for production...');

  // Find entry point
  const entryPoint = findEntryPoint();

  if (!entryPoint) {
    throw new Error(
      'Could not find entry point. Make sure you have an index file in your project.'
    );
  }

  console.log(`Entry point: ${entryPoint}`);

  // Clean output directory
  if (fs.existsSync(out)) {
    fs.rmSync(out, { recursive: true });
  }

  // Create output directory
  fs.mkdirSync(out, { recursive: true });

  // Copy public assets
  if (fs.existsSync('public')) {
    copyDirectory('public', path.join(out, 'public'));
  }

  // Bundle the app
  await bundleApp(entryPoint, out, {
    minify,
    sourceMaps: sourcemap,
    target: target as any,
    cssExtract: true,
  });

  // Create HTML file
  createHTML(out, ssr);

  // Build SSR if enabled
  if (ssr) {
    await buildSSR(entryPoint, out);
  }

  console.log(`Build completed successfully! Output: ${out}`);
}

/**
 * Finds the entry point of a Helix project
 */
function findEntryPoint(): string | null {
  const possibleEntryPoints = [
    'src/index.tsx',
    'src/index.jsx',
    'src/index.ts',
    'src/index.js',
    'index.tsx',
    'index.jsx',
    'index.ts',
    'index.js',
  ];

  for (const entryPoint of possibleEntryPoints) {
    if (fs.existsSync(entryPoint)) {
      return entryPoint;
    }
  }

  return null;
}

/**
 * Creates the HTML file for the build
 */
function createHTML(outDir: string, _ssr: boolean): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Helix App</title>
  <link rel="stylesheet" href="/bundle.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/index.js"></script>
</body>
</html>
  `.trim();

  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

/**
 * Builds the server-side rendering bundle
 */
async function buildSSR(entryPoint: string, outDir: string): Promise<void> {
  console.log('Building SSR bundle...');

  // Find server entry point
  const serverEntryPoint = findServerEntryPoint();

  if (!serverEntryPoint) {
    console.warn(
      'SSR enabled but no server entry point found. Skipping SSR build.'
    );
    return;
  }

  // Bundle the server
  await bundleApp(serverEntryPoint, path.join(outDir, 'server'), {
    minify: false,
    target: 'es2020',
  });

  console.log('SSR bundle built successfully!');
}

/**
 * Finds the server entry point for SSR
 */
function findServerEntryPoint(): string | null {
  const possibleEntryPoints = [
    'src/server/index.ts',
    'src/server/index.js',
    'server/index.ts',
    'server/index.js',
  ];

  for (const entryPoint of possibleEntryPoints) {
    if (fs.existsSync(entryPoint)) {
      return entryPoint;
    }
  }

  return null;
}

/**
 * Copies a directory recursively
 */
function copyDirectory(source: string, target: string): void {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Copy all files and subdirectories
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}
