// src/components/TodoItem.tsx - Individual todo item component
import { h } from 'helix';
import { Todo } from '../stores/todoStore';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
}

export default function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  return h(
    'li',
    { 
      className: `todo-item ${todo.completed ? 'completed' : ''}`,
      'data-id': todo.id
    },
    h('div', { className: 'todo-content' },
      h('input', {
        type: 'checkbox',
        className: 'todo-checkbox',
        checked: todo.completed,
        onChange: onToggle
      }),
      h('span', { className: 'todo-text' }, todo.text)
    ),
    h('button', {
      className: 'todo-delete',
      onClick: onRemove,
      'aria-label': 'Delete todo'
    }, '×')
  );
}