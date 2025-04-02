/**
 * Asset bundling for Helix applications
 */

import fs from 'node:fs';
import path from 'node:path';
import { transformCode } from './transform';
import { optimizeCode } from './optimize';

/**
 * Bundles a Helix application
 */
export async function bundleApp(
  entryPoint: string,
  outputDir: string,
  options: {
    minify?: boolean;
    sourceMaps?: boolean;
    cssExtract?: boolean;
    target?: 'es2015' | 'es2020' | 'esnext';
  } = {}
): Promise<void> {
  const {
    minify = process.env.NODE_ENV === 'production',
    sourceMaps = !minify,
    cssExtract = true,
    target = 'es2020',
  } = options;

  // Create a dependency graph
  const graph = await createDependencyGraph(entryPoint);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Bundle CSS if extraction is enabled
  const cssBundle = cssExtract ? extractCSS(graph) : null;

  // Generate bundles
  await generateBundles(graph, outputDir, {
    minify,
    sourceMaps,
    target,
  });

  // Write CSS bundle if extracted
  if (cssBundle && cssExtract) {
    const cssPath = path.join(outputDir, 'bundle.css');
    fs.writeFileSync(cssPath, cssBundle);
  }
}

/**
 * Creates a dependency graph from an entry point
 */
async function createDependencyGraph(
  entryPoint: string,
  visited = new Set<string>()
): Promise<Map<string, { code: string; deps: string[] }>> {
  const graph = new Map();

  // Skip if already visited
  if (visited.has(entryPoint)) {
    return graph;
  }

  // Mark as visited
  visited.add(entryPoint);

  // Read file
  const code = fs.readFileSync(entryPoint, 'utf-8');

  // Extract dependencies
  const deps = extractDependencies(code, path.dirname(entryPoint));

  // Add to graph
  graph.set(entryPoint, { code, deps });

  // Process dependencies
  for (const dep of deps) {
    // Skip external dependencies
    if (
      !dep.startsWith('.') &&
      !dep.startsWith('/') &&
      !dep.startsWith(process.cwd())
    ) {
      continue;
    }

    // Resolve path
    const depPath = path.resolve(path.dirname(entryPoint), dep);

    // Recursively build graph
    const subgraph = await createDependencyGraph(depPath, visited);

    // Merge graphs
    for (const [key, value] of subgraph.entries()) {
      graph.set(key, value);
    }
  }

  return graph;
}

/**
 * Extracts dependencies from code
 */
function extractDependencies(code: string, _basePath: string): string[] {
  const deps: string[] = [];

  // Match import statements
  const importRegex = /import\s+(?:[\w\s{},*]*from\s+)?['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    deps.push(match[1]);
  }

  // Match dynamic imports
  const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

  while ((match = dynamicImportRegex.exec(code)) !== null) {
    deps.push(match[1]);
  }

  return deps;
}

/**
 * Extracts CSS from the dependency graph
 */
function extractCSS(
  graph: Map<string, { code: string; deps: string[] }>
): string {
  let cssBundle = '';

  for (const [filePath, { code }] of graph.entries()) {
    // Only process CSS files
    if (!filePath.endsWith('.css')) continue;

    // Extract CSS module exports
    const cssCode = extractCSSCode(code, filePath);

    // Add to bundle
    cssBundle += `/* ${path.basename(filePath)} */\n${cssCode}\n`;
  }

  return cssBundle;
}

/**
 * Extracts CSS code from a file
 */
function extractCSSCode(code: string, filePath: string): string {
  // For CSS files, return the raw content
  if (filePath.endsWith('.css')) {
    return code;
  }

  // For JS/TS files, extract CSS from template literals
  const cssRegex = /css`([\s\S]*?)`/g;
  let match;
  let cssCode = '';

  while ((match = cssRegex.exec(code)) !== null) {
    cssCode += match[1] + '\n';
  }

  return cssCode;
}

/**
 * Generates bundles from a dependency graph
 */
async function generateBundles(
  graph: Map<string, { code: string; deps: string[] }>,
  outputDir: string,
  options: {
    minify: boolean;
    sourceMaps: boolean;
    target: 'es2015' | 'es2020' | 'esnext';
  }
): Promise<void> {
  // Process each file
  for (const [filePath, { code }] of graph.entries()) {
    // Skip CSS files (handled separately)
    if (filePath.endsWith('.css')) continue;

    // Transform code
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    const transformed = transformCode(code, {
      filename: filePath,
      isTypeScript,
      sourceMaps: options.sourceMaps,
    });

    // Optimize code
    const optimized = await optimizeCode(transformed.code, {
      minify: options.minify,
      target: options.target,
    });

    // Determine output path
    const relativePath = path.relative(process.cwd(), filePath);
    const outputPath = path.join(
      outputDir,
      relativePath.replace(/\.(tsx?|jsx?)$/, '.js').replace(/^src\//, '')
    );

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write output
    fs.writeFileSync(outputPath, optimized);

    // Write source map if enabled
    if (options.sourceMaps && transformed.map) {
      fs.writeFileSync(`${outputPath}.map`, JSON.stringify(transformed.map));
    }
  }
}
