/**
 * Client-side routing for Helix
 */

import { createSignal, createEffect as _createEffect } from './reactivity';
import { h } from './component';
import type { Element } from './types';

type Routes = Record<string, (params?: Record<string, string>) => Element>;

/**
 * Creates a router for client-side navigation
 */
export function createRouter(routes: Routes) {
  // Current path signal
  const [currentPath, setCurrentPath] = createSignal(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Set up history navigation if in browser
  if (typeof window !== 'undefined') {
    // Handle navigation
    window.addEventListener('popstate', () => {
      setCurrentPath(window.location.pathname);
    });

    // Initial state
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Navigation helper
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  // Match route with params
  const matchRoute = (path: string): [(props: any) => any, Record<string, string>] => {
    // Exact match
    if (routes[path]) {
      return [routes[path], {}];
    }

    // Match with params
    for (const [routePath, component] of Object.entries(routes)) {
      if (routePath === '*') continue;

      // Convert route to regex
      const paramNames: string[] = [];
      const regexString = routePath
        .replace(/:[^/]+/g, match => {
          paramNames.push(match.slice(1));
          return '([^/]+)';
        })
        .replace(/\//g, '/');

      const regex = new RegExp(`^${regexString}$`);
      const match = path.match(regex);

      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return [component, params];
      }
    }

    // Fallback route
    return [routes['*'] || (() => h('div', {}, 'Not Found')), {}];
  };

  // Router component
  const Router = () => {
    const path = currentPath();
    const [component, params] = matchRoute(path);

    return component(params);
  };

  return {
    Router,
    navigate,
    currentPath,
  };
}
