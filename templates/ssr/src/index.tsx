// Client entry point for hydration
import { h, hydrate } from 'helix-kit';
import App from './App';

// Get initial data from the server
declare global {
  interface Window {
    __INITIAL_DATA__: any;
  }
}

// Get the app container
const appRoot = document.getElementById('app');

// Hydrate the app
if (appRoot) {
  // Pass the initial data from the server to the client app
  hydrate(
    h(App, { 
      initialData: window.__INITIAL_DATA__,
      url: window.location.pathname
    }), 
    appRoot
  );
  
  // Log hydration success
  console.log('Helix-Kit app hydrated successfully!');
} else {
  console.error('Could not find app root element for hydration');
}

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}