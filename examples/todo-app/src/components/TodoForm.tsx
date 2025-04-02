// src/components/TodoForm.tsx - Form for adding new todos
import { h, createSignal } from 'helix';

interface TodoFormProps {
  onSubmit: (text: string) => void;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [text, setText] = createSignal('');
  
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const value = text().trim();
    
    if (value) {
      onSubmit(value);
      setText('');
    }
  };
  
  return h(
    'form',
    { 
      className: 'todo-form',
      onSubmit: handleSubmit
    },
    h('input', {
      type: 'text',
      className: 'todo-input',
      placeholder: 'What needs to be done?',
      value: text(),
      onInput: (e: InputEvent) => {
        const target = e.target as HTMLInputElement;
        setText(target.value);
      }
    }),
    h('button', {
      type: 'submit',
      className: 'todo-submit',
      disabled: text().trim() === ''
    }, 'Add')
  );
}