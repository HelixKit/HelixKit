/**
 * Global type declarations for Helix-Kit
 */

// Babel plugin declarations
declare module '@babel/plugin-transform-react-jsx';
declare module '@babel/plugin-transform-typescript';
declare module 'terser';

// Extend Window interface to include Helix properties
interface Window {
  __HELIX_DATA__?: Record<string, unknown>;
  __HELIX_HYDRATE__?: boolean;
}

// DOM element extension for Helix root marker
interface HTMLElement {
  _helixRoot?: boolean;
}