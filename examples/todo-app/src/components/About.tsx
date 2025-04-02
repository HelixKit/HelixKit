// src/components/About.tsx - About page component
import { h } from 'helix';

export default function About() {
  return h(
    'div',
    { className: 'about-container' },
    h('h2', {}, 'About This App'),
    h('p', {}, 
      'This is a simple Todo application built with Helix, a lightweight and performant JavaScript framework.'
    ),
    h('h3', {}, 'Features'),
    h('ul', {},
      h('li', {}, 'Add, complete, and delete tasks'),
      h('li', {}, 'Filter tasks by status'),
      h('li', {}, 'Persistent storage using localStorage'),
      h('li', {}, 'Reactive UI updates'),
      h('li', {}, 'Client-side routing')
    ),
    h('h3', {}, 'Helix Framework'),
    h('p', {},
      'Helix is a modern JavaScript framework that focuses on performance and simplicity. It provides:'
    ),
    h('ul', {},
      h('li', {}, 'Fine-grained reactivity'),
      h('li', {}, 'Virtual DOM with efficient diffing'),
      h('li', {}, 'Component-based architecture'),
      h('li', {}, 'Built-in state management'),
      h('li', {}, 'SSR capabilities'),
      h('li', {}, 'Suspense for data fetching')
    )
  );
}