// src/components/Header.tsx - App header with navigation
import { h } from 'helix';

interface HeaderProps {
  navigate: (path: string) => void;
}

export default function Header({ navigate }: HeaderProps) {
  return h(
    'header',
    { className: 'app-header' },
    h('h1', {}, 'Helix Todo App'),
    h('nav', { className: 'main-nav' },
      h('ul', {},
        h('li', {},
          h('a', {
            href: '/',
            onClick: (e: Event) => {
              e.preventDefault();
              navigate('/');
            }
          }, 'Todos')
        ),
        h('li', {},
          h('a', {
            href: '/about',
            onClick: (e: Event) => {
              e.preventDefault();
              navigate('/about');
            }
          }, 'About')
        )
      )
    )
  );
}