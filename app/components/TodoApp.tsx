'use client';

import { useTodos } from '../hooks/useTodos';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import TodoFilter from './TodoFilter';
import TodoStats from './TodoStats';

export default function TodoApp() {
  const {
    todos,
    filter,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    clearCompleted,
  } = useTodos();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">TODOアプリ</h1>
      <TodoInput onAddTodo={addTodo} />
      <TodoFilter filter={filter} onFilterChange={setFilter} />
      <TodoList 
        todos={todos} 
        filter={filter}
        onToggleTodo={toggleTodo}
        onUpdateTodo={updateTodo}
        onDeleteTodo={deleteTodo}
      />
      <TodoStats todos={todos} />
      {todos.filter(todo => todo.completed).length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={clearCompleted}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            完了したタスクをクリア
          </button>
        </div>
      )}
    </div>
  );
}