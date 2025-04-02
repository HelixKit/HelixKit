// src/index.tsx - Main entry point for the Todo app
import { h, render } from 'helix';
import App from './App';

// Mount the application to the DOM
const root = document.getElementById('app');
if (root) {
  render(h(App, {}), root);
} else {
  console.error('Root element #app not found');
}

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}
