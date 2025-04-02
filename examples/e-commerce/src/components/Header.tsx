// src/components/Header.tsx - Site header with navigation and cart summary
import { h, createSignal, createEffect } from 'helix';
import { useCart } from '../stores/cartStore';

interface HeaderProps {
  navigate: (path: string) => void;
}

export default function Header({ navigate }: HeaderProps) {
  const { getState } = useCart();
  const [itemCount, setItemCount] = createSignal(0);
  
  // Update cart count when cart changes
  createEffect(() => {
    const cart = getState('items');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
  });
  
  return h('header', { className: 'site-header' },
    h('div', { className: 'header-container' },
      // Logo
      h('div', { className: 'logo' },
        h('a', {
          href: '/',
          onClick: (e: Event) => {
            e.preventDefault();
            navigate('/');
          }
        }, 'HelixShop')
      ),
      
      // Main navigation
      h('nav', { className: 'main-nav' },
        h('ul', {},
          h('li', {},
            h('a', {
              href: '/',
              onClick: (e: Event) => {
                e.preventDefault();
                navigate('/');
              }
            }, 'Home')
          ),
          h('li', {},
            h('a', {
              href: '/products',
              onClick: (e: Event) => {
                e.preventDefault();
                navigate('/products');
              }
            }, 'Products')
          )
        )
      ),
      
      // Cart icon with badge
      h('div', { className: 'cart-widget' },
        h('button', {
          className: 'cart-button',
          onClick: () => navigate('/cart'),
          'aria-label': 'View cart'
        },
          h('span', { className: 'cart-icon' }, '🛒'),
          itemCount() > 0 && h('span', { className: 'cart-badge' }, itemCount())
        )
      )
    )
  );
}