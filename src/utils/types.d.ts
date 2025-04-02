/**
 * Type definitions for Babel transform plugins
 */

// Define types for Babel AST paths and related structures to avoid 'any'
declare interface BabelPath {
  node: any;
  get(name: string): BabelPath;
  isJSXElement(): boolean;
  isJSXAttribute(): boolean;
  replaceWith(node: any): void;
  remove(): void;
}

// Defines the types for Babel transforms
declare interface BabelTransformOptions {
  // Add any specific options here
  [key: string]: any;
}

// Define types for Babel t utility
declare interface BabelTypes {
  isJSXAttribute(node: any): boolean;
  stringLiteral(value: string): any;
  jsxAttribute(name: any, value: any): any;
  objectExpression(properties: any[]): any;
  objectProperty(key: any, value: any): any;
  identifier(name: string): any;
}