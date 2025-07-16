'use client';

import { Todo, FilterType } from '../types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  filter: FilterType;
  onToggleTodo?: (id: string) => void;
  onUpdateTodo?: (id: string, text: string) => void;
  onDeleteTodo?: (id: string) => void;
}

export default function TodoList({ 
  todos, 
  filter,
  onToggleTodo,
  onUpdateTodo,
  onDeleteTodo 
}: TodoListProps) {
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="space-y-2">
      {filteredTodos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {filter === 'all' && 'TODOがありません'}
          {filter === 'active' && 'アクティブなTODOがありません'}
          {filter === 'completed' && '完了したTODOがありません'}
        </p>
      ) : (
        filteredTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggleTodo}
            onUpdate={onUpdateTodo}
            onDelete={onDeleteTodo}
          />
        ))
      )}
    </div>
  );
}