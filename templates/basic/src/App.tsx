import { 
  h, 
  createSignal, 
  createEffect, 
  onMount, 
  createContext,
  Suspense,
  ErrorBoundary
} from 'helix-kit';
import './styles/main.css';

// Create a theme context
const ThemeContext = createContext({ theme: 'light' });

// Counter component
function Counter() {
  const [count, setCount] = createSignal(0);
  const [doubleCount, setDoubleCount] = createSignal(0);
  
  // Effect to update the double count
  createEffect(() => {
    setDoubleCount(count() * 2);
  });
  
  return h('div', { className: 'counter' },
    h('h2', {}, 'Counter Example'),
    h('p', {}, `Count: ${count()}`),
    h('p', {}, `Double: ${doubleCount()}`),
    h('button', { 
      onClick: () => setCount(count() + 1),
      className: 'button'
    }, 'Increment'),
    h('button', { 
      onClick: () => setCount(count() - 1),
      className: 'button'
    }, 'Decrement')
  );
}

// Example of a component that might fail
function MightFail({ shouldFail = false }) {
  if (shouldFail) {
    throw new Error('This component failed intentionally');
  }
  
  return h('div', { className: 'success-component' },
    h('h3', {}, 'This component loaded successfully'),
    h('p', {}, 'Error boundaries protect against runtime errors in components')
  );
}

// Example of an async component
function AsyncData() {
  const [data, setData] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  
  onMount(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData({ message: 'Data loaded successfully!' });
      setLoading(false);
    }, 1500);
  });
  
  if (loading()) {
    return h('div', { className: 'loading' }, 'Loading data...');
  }
  
  return h('div', { className: 'data-display' },
    h('h3', {}, 'Async Data Example'),
    h('pre', {}, JSON.stringify(data(), null, 2))
  );
}

// Main App component
export default function App() {
  const [theme, setTheme] = createSignal('light');
  
  const toggleTheme = () => {
    setTheme(theme() === 'light' ? 'dark' : 'light');
  };
  
  return h('div', { className: `app ${theme()}` },
    // App header
    h('header', { className: 'app-header' },
      h('h1', {}, 'Welcome to Helix-Kit'),
      h('button', { 
        onClick: toggleTheme,
        className: 'theme-toggle'
      }, `Switch to ${theme() === 'light' ? 'dark' : 'light'} theme`)
    ),
    
    // Main content
    h('main', { className: 'app-content' },
      h('p', { className: 'intro' }, 
        'Helix-Kit is a lightweight, high-performance JavaScript framework built for modern web applications.'
      ),
      
      // Counter demo
      h(Counter, {}),
      
      // Suspense example
      h('div', { className: 'demo-section' },
        h('h2', {}, 'Suspense Example'),
        h(Suspense, { 
          fallback: h('div', { className: 'loading' }, 'Loading component...')
        },
          h(AsyncData, {})
        )
      ),
      
      // Error boundary example
      h('div', { className: 'demo-section' },
        h('h2', {}, 'Error Boundary Example'),
        h('div', { className: 'error-buttons' },
          h('button', { 
            className: 'button success',
            onClick: () => window.location.reload()
          }, 'Render without error'),
          h('button', { 
            className: 'button danger',
            onClick: () => {
              const errorComponent = document.getElementById('error-demo');
              if (errorComponent) {
                errorComponent.setAttribute('data-fail', 'true');
                errorComponent.innerHTML = '';
                
                // Force error by rerendering
                const shouldFail = true;
                renderComponent(h(MightFail, { shouldFail }), errorComponent);
              }
            }
          }, 'Trigger error')
        ),
        h(ErrorBoundary, {
          fallback: ({ error, retry }) => h('div', { className: 'error-display' },
            h('h3', {}, 'Error caught!'),
            h('p', {}, error.message),
            h('button', { 
              onClick: retry,
              className: 'button'
            }, 'Retry')
          )
        },
          h('div', { id: 'error-demo' },
            h(MightFail, { shouldFail: false })
          )
        )
      )
    ),
    
    // Footer
    h('footer', { className: 'app-footer' },
      h('p', {}, '© 2025 Helix-Kit Framework - Built with Helix-Kit')
    )
  );
}

// Helper function to render a component
function renderComponent(element, container) {
  // Dynamic import should be avoided in production code
  // This is just for the error demo
  const { render } = require('helix-kit');
  render(element, container);
}
