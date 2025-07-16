'use client';

import { useState, useEffect, useCallback } from 'react';
import { Todo, FilterType } from '../types/todo';

const STORAGE_KEY = 'todos';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  // ローカルストレージからTODOを読み込む
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        if (Array.isArray(parsedTodos)) {
          setTodos(parsedTodos.map((todo: Todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
          })));
        }
      }
    } catch (error) {
      console.error('TODOの読み込みに失敗しました:', error);
      // エラーが発生してもアプリは続行
    }
  }, []);

  // TODOが変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      if (todos.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } else {
        // TODOが0件の場合もストレージを更新（削除後の状態を保持）
        localStorage.setItem(STORAGE_KEY, '[]');
      }
    } catch (error) {
      console.error('TODOの保存に失敗しました:', error);
      // ストレージの容量超過などのエラーをキャッチ
    }
  }, [todos]);

  const addTodo = useCallback((text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  const updateTodo = useCallback((id: string, text: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, text, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);

  return {
    todos,
    filter,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    clearCompleted,
  };
}