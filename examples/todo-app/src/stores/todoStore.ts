// src/stores/todoStore.ts - State management for todo items
import { createStore } from 'helix';

// Todo item type
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Todo store state type
interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null
};

// Create the store
export const todosStore = createStore<TodoState>({
  name: 'todos',
  state: initialState,
  
  // Debugging options
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logActions: true
  },
  
  // Store plugins
  plugins: [
    // Example logger plugin
    store => {
      store.subscribe((state, prevState) => {
        if (process.env.NODE_ENV === 'development') {
          console.group('Todos State Update');
          console.log('Previous:', prevState);
          console.log('Current:', state);
          console.groupEnd();
        }
      });
      
      return store;
    }
  ]
});