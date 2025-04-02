import { h, createSignal, Suspense, createResource, createEffect } from 'helix-kit';
import './styles/main.css';

// Types for initial server-side data
interface AppProps {
  initialData?: {
    url: string;
    timestamp: number;
  };
  url?: string;
}

// Async data fetching
async function fetchServerTime() {
  // For client-side, fetch from API
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data.data;
  }
  
  // For server-side, return mock data
  return {
    message: 'Server time (SSR generated)',
    timestamp: Date.now()
  };
}

// Header component
function Header() {
  return h('header', { className: 'app-header' },
    h('h1', {}, 'Helix-Kit SSR Example'),
    h('nav', {},
      h('a', { href: '/' }, 'Home'),
      h('a', { href: '/about' }, 'About')
    )
  );
}

// Footer component
function Footer() {
  return h('footer', { className: 'app-footer' },
    h('p', {}, '© 2025 Helix-Kit Framework - SSR Template')
  );
}

// Main App component
export default function App({ initialData, url = '/' }: AppProps) {
  // State with default or initial data
  const [currentUrl, setCurrentUrl] = createSignal(url);
  const [isClient, setIsClient] = createSignal(false);
  
  // Get server time data with Suspense
  const [serverTime] = createResource(fetchServerTime);
  
  // Effect to detect client-side hydration
  createEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Handle client-side navigation
      const handleNavigation = () => {
        setCurrentUrl(window.location.pathname);
      };
      
      window.addEventListener('popstate', handleNavigation);
      return () => window.removeEventListener('popstate', handleNavigation);
    }
  });
  
  // Simple client-side router
  const renderContent = () => {
    switch (currentUrl()) {
      case '/about':
        return h('div', { className: 'about-page' },
          h('h2', {}, 'About This Template'),
          h('p', {}, 'This is a Server-Side Rendering (SSR) example for the Helix-Kit framework.'),
          h('p', {}, 'It demonstrates how to build isomorphic applications that render on both server and client.')
        );
      default:
        return h('div', { className: 'home-page' },
          h('h2', {}, 'Welcome to Helix-Kit SSR'),
          
          // Show initial data
          initialData && h('div', { className: 'server-data' },
            h('h3', {}, 'Initial Server Data'),
            h('pre', {}, JSON.stringify(initialData, null, 2))
          ),
          
          // Fetch additional data with Suspense
          h('div', { className: 'data-section' },
            h('h3', {}, 'Server Time'),
            h(Suspense, {
              fallback: h('div', { className: 'loading' }, 'Loading server time...')
            },
              h('pre', { className: 'data' }, 
                JSON.stringify(serverTime(), null, 2)
              )
            )
          ),
          
          // Hydration indicator
          h('div', { className: 'hydration-indicator' },
            h('p', {}, isClient() 
              ? 'Page is hydrated! Interactive components are now active.' 
              : 'This content was rendered on the server.'
            ),
            isClient() && h('button', {
              className: 'refresh-button',
              onClick: () => window.location.reload()
            }, 'Refresh Page')
          )
        );
    }
  };
  
  // Handle client-side navigation
  const handleLinkClick = (e: MouseEvent, path: string) => {
    if (isClient()) {
      e.preventDefault();
      window.history.pushState(null, '', path);
      setCurrentUrl(path);
    }
  };
  
  return h('div', { className: 'app-container' },
    h(Header, {}),
    h('main', { className: 'content' },
      renderContent()
    ),
    h(Footer, {})
  );
}