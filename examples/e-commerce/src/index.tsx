// src/index.tsx - Main entry point for the e-commerce example
import { h, render, ErrorBoundary } from 'helix';
import App from './App';

// Mount the application
const root = document.getElementById('app');

if (root) {
  render(
    h(ErrorBoundary, {
      fallback: ({ error }) => h('div', { className: 'fatal-error' },
        h('h1', {}, 'Something went wrong'),
        h('p', {}, error.message),
        h('button', { 
          onClick: () => window.location.reload() 
        }, 'Reload App')
      )
    }, 
      h(App, {})
    ),
    root
  );
} else {
  console.error('Root element #app not found');
}

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}