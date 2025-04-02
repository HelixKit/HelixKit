// src/components/Footer.tsx - Site footer
import { h } from 'helix';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return h('footer', { className: 'site-footer' },
    h('div', { className: 'footer-container' },
      h('div', { className: 'footer-section' },
        h('h3', {}, 'HelixShop'),
        h('p', {}, 'A demo e-commerce site built with Helix, the lightweight and performant JavaScript framework.')
      ),
      
      h('div', { className: 'footer-section' },
        h('h3', {}, 'Links'),
        h('ul', { className: 'footer-links' },
          h('li', {}, h('a', { href: '/' }, 'Home')),
          h('li', {}, h('a', { href: '/products' }, 'Products')),
          h('li', {}, h('a', { href: '/cart' }, 'Cart'))
        )
      ),
      
      h('div', { className: 'footer-section' },
        h('h3', {}, 'Connect'),
        h('ul', { className: 'footer-links' },
          h('li', {}, h('a', { href: '#' }, 'Twitter')),
          h('li', {}, h('a', { href: '#' }, 'GitHub')),
          h('li', {}, h('a', { href: '#' }, 'Discord'))
        )
      )
    ),
    
    h('div', { className: 'footer-bottom' },
      h('p', {}, `© ${currentYear} HelixShop. All rights reserved.`),
      h('p', {}, 'Built with Helix Framework')
    )
  );
}