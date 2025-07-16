'use client';

import { Todo } from '../types/todo';

interface TodoStatsProps {
  todos: Todo[];
}

export default function TodoStats({ todos }: TodoStatsProps) {
  const totalCount = todos.length;
  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  if (totalCount === 0) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between text-sm text-gray-600">
        <span>全体: {totalCount}件</span>
        <span>アクティブ: {activeCount}件</span>
        <span>完了: {completedCount}件</span>
      </div>
      {completedCount > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            進捗率: {Math.round((completedCount / totalCount) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}