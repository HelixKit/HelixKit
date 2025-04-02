/**
 * Code optimization for Helix applications
 */

import { transformSync } from '@babel/core';
import { minify } from 'terser';

/**
 * Optimizes JavaScript code
 */
export async function optimizeCode(
  code: string,
  options: {
    minify?: boolean;
    treeshake?: boolean;
    target?: 'es2015' | 'es2020' | 'esnext';
  } = {}
): Promise<string> {
  const {
    minify: shouldMinify = true,
    treeshake = true,
    target = 'es2020',
  } = options;

  let optimizedCode = code;

  // Tree shaking
  if (treeshake) {
    optimizedCode = performTreeshaking(optimizedCode, target);
  }

  // Minification
  if (shouldMinify) {
    const minifyResult = await minify(optimizedCode, {
      compress: {
        ecma: target === 'es2015' ? 2015 : target === 'es2020' ? 2020 : 2022,
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_symbols: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    });

    optimizedCode = minifyResult.code || optimizedCode;
  }

  return optimizedCode;
}

/**
 * Performs tree shaking on the code
 */
function performTreeshaking(
  code: string,
  target: 'es2015' | 'es2020' | 'esnext' = 'es2020'
): string {
  // Simple tree shaking implementation
  // In a real implementation, this would use a more sophisticated
  // approach with dependency graph analysis

  // For now, just a simple transform to convert to the target
  const result = transformSync(code, {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            esmodules: target !== 'es2015',
          },
          modules: false,
        },
      ],
    ],
  });

  return result?.code || code;
}

/**
 * Removes dead code from a file
 */
export function removeDeadCode(code: string): string {
  // Simple dead code elimination
  // In a real implementation, this would use a more sophisticated
  // approach to detect and remove unused code

  return (
    code
      // Remove console.log in production
      .replace(/console\.(log|debug|info)\(.*?\);?/g, '')
      // Remove unused imports (simplified)
      .replace(
        /import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g,
        (match, imports, source) => {
          const usedImports = imports
            .split(',')
            .map((i: string) => i.trim())
            .filter((i: string) => {
              // Check if import is used in the code
              const importName = i.split(' as ')[1]?.trim() || i.trim();
              const regex = new RegExp(
                `[^a-zA-Z0-9_$]${importName}[^a-zA-Z0-9_$]`
              );
              return regex.test(code);
            })
            .join(', ');

          return usedImports
            ? `import { ${usedImports} } from '${source}'`
            : '';
        }
      )
  );
}
