// src/components/LoadingSpinner.tsx - Loading indicator
import { h } from 'helix';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...' 
}: LoadingSpinnerProps) {
  const sizeClass = `spinner-${size}`;
  
  return h('div', { className: 'spinner-container' },
    h('div', { className: `spinner ${sizeClass}` }),
    message && h('p', { className: 'spinner-message' }, message)
  );
}