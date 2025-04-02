/**
 * Static site generation for Helix
 */

import fs from 'node:fs';
import path from 'node:path';
import { renderToHTML as _renderToHTML } from '../ssr/render';
import type { Command } from 'commander';

/**
 * Registers the generate command
 */
export function generateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate static site')
    .option('-o, --out <dir>', 'Output directory', 'dist')
    .option(
      '-r, --routes <routes>',
      'Routes to pre-render (comma-separated)',
      '/'
    )
    .option('--no-hydrate', 'Disable client-side hydration')
    .action(async options => {
      try {
        await generateStaticSite(options);
      } catch (error) {
        console.error('Static site generation failed:', error);
        process.exit(1);
      }
    });
}

/**
 * Generates a static site from a Helix app
 */
export async function generateStaticSite(options: {
  out: string;
  routes: string;
  hydrate: boolean;
}): Promise<void> {
  const { out = 'dist', routes = '/', hydrate = true } = options;

  console.log('Generating static site...');

  // Parse routes
  const routesList = routes.split(',').map(route => route.trim());

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

  // Build the app first
  await buildApp(entryPoint, out);

  // Generate HTML for each route
  for (const route of routesList) {
    await generateRouteHTML(route, entryPoint, out, hydrate);
  }

  console.log(`Static site generation completed successfully! Output: ${out}`);
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
 * Builds the app for static generation
 */
async function buildApp(entryPoint: string, outDir: string): Promise<void> {
  // In a real implementation, this would use the bundler to create
  // the client-side JavaScript bundle
  console.log('Building client-side bundle...');

  // For demonstration purposes, we'll just copy needed files
  fs.mkdirSync(path.join(outDir, 'js'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'css'), { recursive: true });

  // Create placeholder bundle files
  fs.writeFileSync(
    path.join(outDir, 'js', 'bundle.js'),
    '// Client-side bundle'
  );
  fs.writeFileSync(path.join(outDir, 'css', 'styles.css'), '/* CSS styles */');
}

/**
 * Generates HTML for a specific route
 */
async function generateRouteHTML(
  route: string,
  entryPoint: string,
  outDir: string,
  hydrate: boolean
): Promise<void> {
  console.log(`Generating HTML for route: ${route}`);

  // Create directory for the route
  const routeDir = path.join(outDir, route === '/' ? '' : route);
  fs.mkdirSync(routeDir, { recursive: true });

  // In a real implementation, this would:
  // 1. Import the app component
  // 2. Render it to HTML with the specified route
  // 3. Write the HTML file

  // For demonstration purposes, we'll create a placeholder HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Helix App - ${route}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div id="app">
    <!-- App rendered content for route: ${route} -->
  </div>
  ${hydrate ? '<script src="/js/bundle.js" defer></script>' : ''}
</body>
</html>
  `.trim();

  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
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
