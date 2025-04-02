import { h, createSignal, createEffect, onMount } from 'helix';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { Todo, todosStore } from '../stores/todoStore';

export default function TodoList() {
  // Get state from the todo store
  const { getState, setState, createActions } = todosStore;
  
  // Create a filtered todos signal
  const [filter, setFilter] = createSignal('all');
  const [filteredTodos, setFilteredTodos] = createSignal<Todo[]>([]);
  
  // Actions for the todo list
  const actions = createActions((store) => ({
    addTodo: (text: string) => {
      const todos = store.getState('todos');
      const newTodo: Todo = {
        id: Date.now(),
        text,
        completed: false
      };
      store.setState('todos', [...todos, newTodo]);
    },
    
    toggleTodo: (id: number) => {
      const todos = store.getState('todos');
      store.setState('todos', todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    },
    
    removeTodo: (id: number) => {
      const todos = store.getState('todos');
      store.setState('todos', todos.filter(todo => todo.id !== id));
    },
    
    clearCompleted: () => {
      const todos = store.getState('todos');
      store.setState('todos', todos.filter(todo => !todo.completed));
    }
  }));
  
  // Effect to update filtered todos when the filter or todos change
  createEffect(() => {
    const todos = getState('todos');
    const currentFilter = filter();
    
    switch (currentFilter) {
      case 'active':
        setFilteredTodos(todos.filter(todo => !todo.completed));
        break;
      case 'completed':
        setFilteredTodos(todos.filter(todo => todo.completed));
        break;
      default:
        setFilteredTodos(todos);
        break;
    }
  });
  
  // Load todos from localStorage on mount
  onMount(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setState('todos', JSON.parse(storedTodos));
    }
    
    // Save todos to localStorage when they change
    createEffect(() => {
      const todos = getState('todos');
      localStorage.setItem('todos', JSON.stringify(todos));
    });
  });
  
  // Get the active todo count
  const activeCount = () => {
    return getState('todos').filter(todo => !todo.completed).length;
  };
  
  return h('div', { className: 'todo-container' },
    h(TodoForm, { onSubmit: actions.addTodo }),
    
    h('ul', { className: 'todo-list' },
      filteredTodos().map(todo =>
        h(TodoItem, {
          key: todo.id,
          todo,
          onToggle: () => actions.toggleTodo(todo.id),
          onRemove: () => actions.removeTodo(todo.id)
        })
      )
    ),
    
    h('div', { className: 'todo-footer' },
      h('span', { className: 'todo-count' },
        `${activeCount()} items left`
      ),
      
      h('div', { className: 'todo-filters' },
        h('button', {
          className: filter() === 'all' ? 'active' : '',
          onClick: () => setFilter('all')
        }, 'All'),
        
        h('button', {
          className: filter() === 'active' ? 'active' : '',
          onClick: () => setFilter('active')
        }, 'Active'),
        
        h('button', {
          className: filter() === 'completed' ? 'active' : '',
          onClick: () => setFilter('completed')
        }, 'Completed')
      ),
      
      h('button', {
        className: 'clear-completed',
        onClick: actions.clearCompleted
      }, 'Clear completed')
    )
  );
}
