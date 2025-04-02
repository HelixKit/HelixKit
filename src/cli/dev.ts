/**
 * Development server for Helix
 */

import fs from 'node:fs';
import path from 'node:path';
import { transformCode } from '../compiler/transform';
import type { Command } from 'commander';

/**
 * Registers the dev command
 */
export function devCommand(program: Command): void {
  program
    .command('dev')
    .description('Start development server')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('--host <host>', 'Host to listen on', 'localhost')
    .option('--no-hmr', 'Disable Hot Module Replacement')
    .action(async options => {
      try {
        await startDevServer(options);
      } catch (error) {
        console.error('Failed to start dev server:', error);
        process.exit(1);
      }
    });
}

/**
 * Starts the development server
 */
export async function startDevServer(options: {
  port: string;
  host: string;
  hmr: boolean;
}): Promise<void> {
  const { port = '3000', host = 'localhost', hmr = true } = options;

  const portNumber = parseInt(port, 10);

  console.log(`Starting development server at http://${host}:${portNumber}`);

  // Find entry point
  const entryPoint = findEntryPoint();

  if (!entryPoint) {
    throw new Error(
      'Could not find entry point. Make sure you have an index file in your project.'
    );
  }

  console.log(`Entry point: ${entryPoint}`);

  // Create server
  const server = Bun.serve({
    port: portNumber,
    hostname: host,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Serve static files
      if (pathname.startsWith('/public/')) {
        const filePath = path.join(process.cwd(), pathname);

        if (fs.existsSync(filePath)) {
          const file = Bun.file(filePath);
          return new Response(file);
        }
      }

      // Hot Module Replacement endpoint
      if (pathname === '/__helix_hmr') {
        return createHMREndpoint(req);
      }

      // Serve transformed files
      if (
        pathname.endsWith('.js') ||
        pathname.endsWith('.jsx') ||
        pathname.endsWith('.ts') ||
        pathname.endsWith('.tsx')
      ) {
        const filePath = path.join(process.cwd(), pathname);

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const isTypeScript =
            filePath.endsWith('.ts') || filePath.endsWith('.tsx');

          const transformed = transformCode(content, {
            filename: filePath,
            isTypeScript,
            sourceMaps: true,
          });

          // Inject HMR if enabled
          const finalCode = hmr
            ? injectHMR(transformed.code, pathname)
            : transformed.code;

          return new Response(finalCode, {
            headers: {
              'Content-Type': 'application/javascript',
            },
          });
        }
      }

      // Serve HTML for any other path (SPA)
      return serveHTML(entryPoint, hmr);
    },
  });

  // Watch files for changes if HMR is enabled
  if (hmr) {
    watchForChanges();
  }

  console.log(`Dev server running at http://${server.hostname}:${server.port}`);
  console.log('Ready for development!');

  return new Promise(() => {}); // Keep server running
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
 * Serves the HTML for the development server
 */
function serveHTML(entryPoint: string, hmr: boolean): Response {
  const entryPointPath = `/${entryPoint}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Helix Dev</title>
</head>
<body>
  <div id="app"></div>
  ${hmr ? '<script src="/__helix_hmr_client.js"></script>' : ''}
  <script type="module" src="${entryPointPath}"></script>
</body>
</html>
  `.trim();

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

/**
 * Creates the HMR endpoint
 */
function createHMREndpoint(_req: Request): Response {
  // This would implement HMR functionality
  // For simplicity, we're returning a basic response
  return new Response('HMR not implemented in this example', {
    status: 501,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Injects HMR support into code
 */
function injectHMR(code: string, _modulePath: string): string {
  return `
// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
}

${code}
  `;
}

/**
 * Watches for file changes
 */
function watchForChanges(): void {
  // In a real implementation, this would use the file system watcher
  // to detect changes and trigger HMR updates
  console.log('Watching for file changes...');
}
