// src/components/Footer.tsx - App footer component
import { h } from 'helix';

export default function Footer() {
  return h(
    'footer',
    { className: 'app-footer' },
    h('p', {}, 'Built with Helix - The modern reactive framework')
  );
}
