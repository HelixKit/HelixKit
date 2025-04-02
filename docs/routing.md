# Routing

Client-side routing is essential for building single-page applications. Helix-Kit provides a lightweight, declarative routing system that makes it easy to create multi-page experiences without full page reloads.

## Basic Routing

The `createRouter` function is the primary API for creating routes in Helix.

```tsx
import { h, createRouter } from 'helix-kit';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import UserPage from './pages/User';
import NotFoundPage from './pages/NotFound';

// Create router with route definitions
const { Router, navigate } = createRouter({
  '/': () => h(HomePage, {}),
  '/about': () => h(AboutPage, {}),
  '/users/:id': ({ id }) => h(UserPage, { userId: id }),
  '*': () => h(NotFoundPage, {})
});

// App component with Router
function App() {
  return h('div', { className: 'app' },
    h('nav', {},
      h('a', { 
        href: '/',
        onClick: (e) => {
          e.preventDefault();
          navigate('/');
        }
      }, 'Home'),
      h('a', { 
        href: '/about',
        onClick: (e) => {
          e.preventDefault();
          navigate('/about');
        }
      }, 'About'),
      h('a', { 
        href: '/users/123',
        onClick: (e) => {
          e.preventDefault();
          navigate('/users/123');
        }
      }, 'User Profile')
    ),
    h('main', {},
      h(Router, {})
    )
  );
}
```

## Route Parameters

Routes can include parameters denoted with a colon (`:`) prefix. These parameters are passed to your component as props.

```tsx
// Route definition with parameters
const { Router } = createRouter({
  '/users/:id': ({ id }) => h(UserProfile, { userId: id }),
  '/products/:category/:productId': ({ category, productId }) => 
    h(ProductDetail, { category, productId })
});

// Component using route parameters
function UserProfile({ userId }) {
  return h('div', {},
    h('h1', {}, 'User Profile'),
    h('p', {}, `User ID: ${userId}`)
  );
}
```

## Wildcard Routes

Use `*` to create a catch-all route for handling 404 pages or unknown routes:

```tsx
const { Router } = createRouter({
  '/': () => h(HomePage, {}),
  '/about': () => h(AboutPage, {}),
  '*': () => h(NotFoundPage, {})
});
```

## Navigation

The `navigate` function returned by `createRouter` allows programmatic navigation:

```tsx
import { h, createRouter } from 'helix-kit';

const { Router, navigate } = createRouter({
  '/': () => h(HomePage, {}),
  '/dashboard': () => h(DashboardPage, {})
});

function LoginForm() {
  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Login logic here...
    const success = await loginUser(username, password);
    
    if (success) {
      // Redirect to dashboard after login
      navigate('/dashboard');
    }
  };
  
  return h('form', { onSubmit: handleSubmit },
    // Form inputs...
    h('button', { type: 'submit' }, 'Login')
  );
}
```

### Navigation Options

The `navigate` function accepts options as a second parameter:

```tsx
// Navigate with options
navigate('/users/123', { 
  replace: true,         // Replace the current history entry instead of pushing
  state: { from: 'login' } // Add state to the history entry
});
```

## Link Component

For a more declarative approach, you can create a Link component:

```tsx
import { h } from 'helix';

// Link component
function Link({ to, children, ...props }) {
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };
  
  return h('a', { 
    href: to,
    onClick: handleClick,
    ...props
  }, children);
}

// Usage
function Nav() {
  return h('nav', {},
    h(Link, { to: '/' }, 'Home'),
    h(Link, { to: '/about' }, 'About'),
    h(Link, { to: '/contact' }, 'Contact')
  );
}
```

## Nested Routes

You can implement nested routes in Helix:

```tsx
import { h, createRouter } from 'helix';

// Child routes for settings
function SettingsRouter() {
  const { Router, navigate } = createRouter({
    '/settings': () => h(SettingsOverview, {}),
    '/settings/profile': () => h(ProfileSettings, {}),
    '/settings/account': () => h(AccountSettings, {}),
    '/settings/notifications': () => h(NotificationSettings, {}),
    '*': () => h('div', {}, 'Settings page not found')
  });
  
  return h('div', { className: 'settings-container' },
    h('nav', { className: 'settings-nav' },
      h(Link, { to: '/settings' }, 'Overview'),
      h(Link, { to: '/settings/profile' }, 'Profile'),
      h(Link, { to: '/settings/account' }, 'Account'),
      h(Link, { to: '/settings/notifications' }, 'Notifications')
    ),
    h('div', { className: 'settings-content' },
      h(Router, {})
    )
  );
}

// Main router
const { Router } = createRouter({
  '/': () => h(HomePage, {}),
  '/dashboard': () => h(DashboardPage, {}),
  '/settings*': () => h(SettingsRouter, {}),
  '*': () => h(NotFoundPage, {})
});
```

## Route Guards

You can implement route guards to protect routes:

```tsx
import { h, createRouter } from 'helix';
import { isAuthenticated } from './auth';

// Create a protected route component
function ProtectedRoute({ component, redirectTo = '/login' }) {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page
    navigate(redirectTo, { replace: true });
    return null;
  }
  
  // Render the protected component
  return h(component, {});
}

// Use the protected route
const { Router } = createRouter({
  '/': () => h(HomePage, {}),
  '/login': () => h(LoginPage, {}),
  '/dashboard': () => h(ProtectedRoute, { 
    component: DashboardPage,
    redirectTo: '/login?redirectTo=/dashboard'
  }),
  '/profile': () => h(ProtectedRoute, { 
    component: ProfilePage,
    redirectTo: '/login?redirectTo=/profile'
  }),
  '*': () => h(NotFoundPage, {})
});
```

## Query Parameters

Access query parameters using a custom hook:

```tsx
import { h, createSignal, createEffect } from 'helix-kit';

// Custom hook for query parameters
function useQueryParams() {
  const [params, setParams] = createSignal(
    new URLSearchParams(window.location.search)
  );
  
  // Update parameters when location changes
  createEffect(() => {
    const handleLocationChange = () => {
      setParams(new URLSearchParams(window.location.search));
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  });
  
  return {
    get: (key) => params().get(key),
    getAll: (key) => params().getAll(key),
    has: (key) => params().has(key),
    toString: () => params().toString()
  };
}

// Usage in a component
function SearchResults() {
  const query = useQueryParams();
  const searchTerm = query.get('q') || '';
  const page = parseInt(query.get('page') || '1', 10);
  
  return h('div', {},
    h('h1', {}, 'Search Results'),
    h('p', {}, `Searching for: ${searchTerm}`),
    h('p', {}, `Page: ${page}`)
  );
}
```

## Route Transitions

You can add animations to route transitions:

```tsx
import { h, createSignal, createEffect } from 'helix-kit';

function AnimatedRouter() {
  const { Router, currentRoute } = createRouter({
    '/': () => h(HomePage, {}),
    '/about': () => h(AboutPage, {}),
    '*': () => h(NotFoundPage, {})
  });
  
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  const [prevRoute, setPrevRoute] = createSignal(null);
  
  // Watch for route changes
  createEffect(() => {
    const current = currentRoute();
    if (prevRoute() && prevRoute() !== current) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Duration of animation
    }
    setPrevRoute(current);
  });
  
  return h('div', { 
    className: `page-container ${isTransitioning() ? 'transitioning' : ''}`
  },
    h(Router, {})
  );
}
```

```css
/* CSS for route transitions */
.page-container {
  position: relative;
}

.page-container > * {
  transition: opacity 0.3s, transform 0.3s;
}

.page-container.transitioning > * {
  opacity: 0;
  transform: translateY(20px);
}
```

## Browser History Integration

Helix's router integrates with the browser's History API:

```tsx
// Listen for history changes
createEffect(() => {
  const handlePopState = () => {
    // Update router state when user navigates with browser controls
    updateCurrentRoute(window.location.pathname);
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
});

// Navigate programmatically
function navigate(to, options = {}) {
  const { replace = false, state = {} } = options;
  
  if (replace) {
    window.history.replaceState(state, '', to);
  } else {
    window.history.pushState(state, '', to);
  }
  
  // Update router state
  updateCurrentRoute(to);
}
```

## Route Loading and Lazy Routing

Combine routing with lazy loading for code splitting:

```tsx
import { h, lazy, Suspense, createRouter } from 'helix-kit';

// Lazy load route components
const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
const ContactPage = lazy(() => import('./pages/Contact'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

// Create router with lazy-loaded routes
const { Router } = createRouter({
  '/': () => h(HomePage, {}),
  '/about': () => h(AboutPage, {}),
  '/contact': () => h(ContactPage, {}),
  '*': () => h(NotFoundPage, {})
});

// App with Suspense for lazy-loaded routes
function App() {
  return h('div', { className: 'app' },
    h('nav', {},
      // Navigation links...
    ),
    h('main', {},
      h(Suspense, {
        fallback: h('div', { className: 'loading' }, 'Loading page...')
      },
        h(Router, {})
      )
    )
  );
}
```

## Server-Side Rendering with Routing

When using server-side rendering, initialize the router with the current URL:

```tsx
import { h, createRouter, renderToString } from 'helix-kit';

// Server-side rendering function
function renderApp(url) {
  // Create router with current URL
  const { Router } = createRouter({
    '/': () => h(HomePage, {}),
    '/about': () => h(AboutPage, {}),
    '*': () => h(NotFoundPage, {})
  }, { initialUrl: url });
  
  // App component
  const App = () => h('div', { className: 'app' },
    h('nav', {},
      // Navigation links...
    ),
    h('main', {},
      h(Router, {})
    )
  );
  
  // Render to string
  return renderToString(h(App, {}));
}

// Use in server handler
function handleRequest(req, res) {
  const html = renderApp(req.url);
  res.send(html);
}
```

## Next Steps

- Learn about [State Management](state.md) to handle global state in your app
- Explore [Server-Side Rendering](ssr.md) for improved SEO and performance
- Check out the [API Reference](api/core.md) for detailed API documentation
