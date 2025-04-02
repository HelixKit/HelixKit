// src/App.tsx - Main application component for e-commerce example
import { h, createRouter, Suspense, lazy, ErrorBoundary } from 'helix';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorFallback from './components/ErrorFallback';
import './styles/main.css';

// Lazy-loaded page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Define routes with lazy-loaded components
const { Router, navigate } = createRouter({
  '/': () => h(HomePage, {}),
  '/products': () => h(ProductListPage, {}),
  '/products/:id': ({ id }) => h(ProductDetailPage, { id }),
  '/cart': () => h(CartPage, {}),
  '/checkout': () => h(CheckoutPage, {}),
  '*': () => h(NotFoundPage, {})
});

export default function App() {
  return h('div', { className: 'app-container' },
    h(Header, { navigate }),
    h('main', { className: 'content' },
      // Error boundary for the entire app content
      h(ErrorBoundary, {
        fallback: (props) => h(ErrorFallback, props)
      },
        // Suspense boundary for lazy-loaded routes
        h(Suspense, {
          fallback: h(LoadingSpinner, { size: 'large' })
        },
          h(Router, {})
        )
      )
    ),
    h(Footer, {})
  );
}