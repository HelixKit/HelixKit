import { h, createRouter } from 'helix';
import TodoList from './components/TodoList';
import About from './components/About';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/main.css';

// Define routes
const { Router, navigate } = createRouter({
  '/': () => h(TodoList, {}),
  '/about': () => h(About, {}),
  '*': () => h('div', { className: 'not-found' }, 'Page not found')
});

export default function App() {
  return h('div', { className: 'app-container' },
    h(Header, { navigate }),
    h('main', { className: 'content' },
      h(Router, {})
    ),
    h(Footer, {})
  );
}
