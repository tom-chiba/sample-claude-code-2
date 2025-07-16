import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../useTodos';
import { mockTodos } from '../../__fixtures__/todo/testData';

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('初期状態では空のTODOリストを返す', () => {
    const { result } = renderHook(() => useTodos());
    
    expect(result.current.todos).toEqual([]);
    expect(result.current.filter).toBe('all');
  });

  it('ローカルストレージからTODOを読み込む', () => {
    localStorage.setItem('todos', JSON.stringify(mockTodos));
    
    const { result } = renderHook(() => useTodos());
    
    expect(result.current.todos).toHaveLength(3);
    expect(result.current.todos[0].text).toBe('テストTODO 1');
  });

  it('不正なJSONがある場合でもエラーにならない', () => {
    localStorage.setItem('todos', 'invalid-json');
    
    const { result } = renderHook(() => useTodos());
    
    expect(result.current.todos).toEqual([]);
  });

  describe('addTodo', () => {
    it('新しいTODOを追加できる', () => {
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.addTodo('新しいタスク');
      });
      
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('新しいタスク');
      expect(result.current.todos[0].completed).toBe(false);
    });

    it('TODOを追加するとローカルストレージに保存される', () => {
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.addTodo('保存テスト');
      });
      
      const stored = JSON.parse(localStorage.getItem('todos') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe('保存テスト');
    });
  });

  describe('toggleTodo', () => {
    it('TODOの完了状態を切り替えられる', () => {
      localStorage.setItem('todos', JSON.stringify(mockTodos));
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.toggleTodo('1');
      });
      
      expect(result.current.todos[0].completed).toBe(true);
      
      act(() => {
        result.current.toggleTodo('1');
      });
      
      expect(result.current.todos[0].completed).toBe(false);
    });
  });

  describe('updateTodo', () => {
    it('TODOのテキストを更新できる', () => {
      localStorage.setItem('todos', JSON.stringify(mockTodos));
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.updateTodo('1', '更新されたテキスト');
      });
      
      expect(result.current.todos[0].text).toBe('更新されたテキスト');
    });
  });

  describe('deleteTodo', () => {
    it('TODOを削除できる', () => {
      localStorage.setItem('todos', JSON.stringify(mockTodos));
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.deleteTodo('2');
      });
      
      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos.find(todo => todo.id === '2')).toBeUndefined();
    });
  });

  describe('clearCompleted', () => {
    it('完了したTODOをすべて削除できる', () => {
      localStorage.setItem('todos', JSON.stringify(mockTodos));
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.clearCompleted();
      });
      
      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos.every(todo => !todo.completed)).toBe(true);
    });
  });

  describe('setFilter', () => {
    it('フィルターを変更できる', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.filter).toBe('all');
      
      act(() => {
        result.current.setFilter('active');
      });
      
      expect(result.current.filter).toBe('active');
      
      act(() => {
        result.current.setFilter('completed');
      });
      
      expect(result.current.filter).toBe('completed');
    });
  });
});