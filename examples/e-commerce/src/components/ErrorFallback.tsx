// src/components/ErrorFallback.tsx - Error boundary fallback component
import { h } from 'helix';

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

export default function ErrorFallback({ error, retry }: ErrorFallbackProps) {
  return h('div', { className: 'error-container' },
    h('div', { className: 'error-content' },
      h('h2', {}, 'Something went wrong'),
      
      h('p', { className: 'error-message' }, 
        error.message || 'An unexpected error occurred.'
      ),
      
      process.env.NODE_ENV === 'development' && h('pre', { className: 'error-stack' }, 
        error.stack
      ),
      
      h('div', { className: 'error-actions' },
        h('button', { 
          className: 'retry-button',
          onClick: retry
        }, 'Try Again'),
        
        h('a', { 
          className: 'home-link',
          href: '/',
        }, 'Return to Home')
      )
    )
  );
}