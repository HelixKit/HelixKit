/**
 * JSX/TSX transformer for Helix
 * Converts JSX/TSX to optimized JavaScript
 */

import { transformSync, types as t } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import typescript from '@babel/plugin-transform-typescript';

/**
 * Transforms JSX/TSX code to JavaScript
 */
export function transformCode(
  code: string,
  options: {
    filename?: string;
    jsxImportSource?: string;
    isTypeScript?: boolean;
    sourceMaps?: boolean;
  } = {}
): { code: string; map?: any } {
  const {
    filename = 'unknown.tsx',
    jsxImportSource = 'helix',
    isTypeScript = filename.endsWith('.ts') || filename.endsWith('.tsx'),
    sourceMaps = false,
  } = options;

  // Configure Babel plugins
  const plugins = [
    [
      jsx,
      {
        runtime: 'automatic',
        importSource: jsxImportSource,
      },
    ],
  ];

  // Add TypeScript plugin if needed
  if (isTypeScript) {
    plugins.push([
      typescript,
      {
        isTSX: filename.endsWith('.tsx'),
        allowNamespaces: true,
        allowDeclareFields: true,
      },
    ]);
  }

  // Transform the code
  const result = transformSync(code, {
    filename,
    plugins,
    sourceMaps,
    configFile: false,
    babelrc: false,
  });

  if (!result || !result.code) {
    throw new Error(`Failed to transform ${filename}`);
  }

  return {
    code: result.code,
    map: result.map,
  };
}

/**
 * Custom JSX transformer plugin for optimizations
 */
export function createHelixJSXPlugin(_options = {}) {
  return {
    name: 'helix-jsx-transform',
    visitor: {
      // Optimize JSX expressions
      JSXElement(path: BabelPath) {
        // Static children optimization
        optimizeStaticChildren(path);

        // Component props optimization
        optimizeProps(path);
      },
    },
  };
}

/**
 * Optimize static children in JSX
 */
function optimizeStaticChildren(path: BabelPath) {
  const children = path.node.children;

  // Skip if no children
  if (!children || children.length === 0) return;

  // Combine adjacent static text nodes
  let staticTexts = [];
  const optimizedChildren = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (t.isJSXText(child)) {
      // Collect static text
      staticTexts.push(child.value);
    } else {
      // Flush collected texts
      if (staticTexts.length > 0) {
        const combinedText = staticTexts.join('');
        if (combinedText.trim() !== '') {
          optimizedChildren.push(t.jsxText(combinedText));
        }
        staticTexts = [];
      }

      // Add non-text child
      optimizedChildren.push(child);
    }
  }

  // Flush remaining texts
  if (staticTexts.length > 0) {
    const combinedText = staticTexts.join('');
    if (combinedText.trim() !== '') {
      optimizedChildren.push(t.jsxText(combinedText));
    }
  }

  // Update children
  path.node.children = optimizedChildren;
}

/**
 * Optimize props in JSX
 */
function optimizeProps(path: BabelPath) {
  const attributes = path.node.openingElement.attributes;

  // Skip if no attributes
  if (!attributes || attributes.length === 0) return;

  // Handle style optimization
  const styleAttr = attributes.find(
    (attr: any) => t.isJSXAttribute(attr) && attr.name.name === 'style'
  );

  if (styleAttr && t.isJSXAttribute(styleAttr)) {
    optimizeStyleAttribute(styleAttr);
  }
}

/**
 * Optimize style attribute in JSX
 */
function optimizeStyleAttribute(_styleAttr: any) {
  // Implementation would optimize inline styles
  // e.g., converting string styles to objects, etc.
}
