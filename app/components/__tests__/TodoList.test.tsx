import { render, screen } from '@testing-library/react';
import TodoList from '../TodoList';
import { mockTodos } from '../../__fixtures__/todo/testData';

describe('TodoList', () => {
  const mockOnToggleTodo = jest.fn();
  const mockOnUpdateTodo = jest.fn();
  const mockOnDeleteTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('フィルタリング', () => {
    it('filter="all"の場合、すべてのTODOが表示される', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          filter="all"
          onToggleTodo={mockOnToggleTodo}
          onUpdateTodo={mockOnUpdateTodo}
          onDeleteTodo={mockOnDeleteTodo}
        />
      );
      
      expect(screen.getByText('テストTODO 1')).toBeInTheDocument();
      expect(screen.getByText('テストTODO 2')).toBeInTheDocument();
      expect(screen.getByText('テストTODO 3')).toBeInTheDocument();
    });

    it('filter="active"の場合、未完了のTODOのみ表示される', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          filter="active"
          onToggleTodo={mockOnToggleTodo}
          onUpdateTodo={mockOnUpdateTodo}
          onDeleteTodo={mockOnDeleteTodo}
        />
      );
      
      expect(screen.getByText('テストTODO 1')).toBeInTheDocument();
      expect(screen.queryByText('テストTODO 2')).not.toBeInTheDocument();
      expect(screen.getByText('テストTODO 3')).toBeInTheDocument();
    });

    it('filter="completed"の場合、完了したTODOのみ表示される', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          filter="completed"
          onToggleTodo={mockOnToggleTodo}
          onUpdateTodo={mockOnUpdateTodo}
          onDeleteTodo={mockOnDeleteTodo}
        />
      );
      
      expect(screen.queryByText('テストTODO 1')).not.toBeInTheDocument();
      expect(screen.getByText('テストTODO 2')).toBeInTheDocument();
      expect(screen.queryByText('テストTODO 3')).not.toBeInTheDocument();
    });
  });

  describe('空の状態', () => {
    it('TODOが0件の場合、適切なメッセージが表示される', () => {
      render(
        <TodoList 
          todos={[]} 
          filter="all"
          onToggleTodo={mockOnToggleTodo}
          onUpdateTodo={mockOnUpdateTodo}
          onDeleteTodo={mockOnDeleteTodo}
        />
      );
      
      expect(screen.getByText('TODOがありません')).toBeInTheDocument();
    });

    it('アクティブなTODOが0件の場合、適切なメッセージが表示される', () => {
      const allCompleted = mockTodos.map(todo => ({ ...todo, completed: true }));
      render(
        <TodoList 
          todos={allCompleted} 
          filter="active"
          onToggleTodo={mockOnToggleTodo}
          onUpdateTodo={mockOnUpdateTodo}
          onDeleteTodo={mockOnDeleteTodo}
        />
      );
      
      expect(screen.getByText('アクティブなTODOがありません')).toBeInTheDocument();
    });

    it('完了したTODOが0件の場合、適切なメッセージが表示される', () => {
      const allActive = mockTodos.map(todo => ({ ...todo, completed: false }));
      render(
        <TodoList 
          todos={allActive} 
          filter="completed"
          onToggleTodo={mockOnToggleTodo}
          onUpdateTodo={mockOnUpdateTodo}
          onDeleteTodo={mockOnDeleteTodo}
        />
      );
      
      expect(screen.getByText('完了したTODOがありません')).toBeInTheDocument();
    });
  });

  it('各TODOにコールバック関数が正しく渡される', () => {
    render(
      <TodoList 
        todos={[mockTodos[0]]} 
        filter="all"
        onToggleTodo={mockOnToggleTodo}
        onUpdateTodo={mockOnUpdateTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    checkbox.click();
    
    expect(mockOnToggleTodo).toHaveBeenCalledWith('1');
  });

  it('オプショナルなコールバックを省略してもエラーにならない', () => {
    render(
      <TodoList 
        todos={mockTodos} 
        filter="all"
      />
    );
    
    expect(screen.getByText('テストTODO 1')).toBeInTheDocument();
  });

  it('TODOが更新されると再レンダリングされる', () => {
    const { rerender } = render(
      <TodoList 
        todos={mockTodos} 
        filter="all"
        onToggleTodo={mockOnToggleTodo}
        onUpdateTodo={mockOnUpdateTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );
    
    expect(screen.getByText('テストTODO 1')).toBeInTheDocument();
    
    const updatedTodos = [
      { ...mockTodos[0], text: '更新されたTODO' },
      ...mockTodos.slice(1)
    ];
    
    rerender(
      <TodoList 
        todos={updatedTodos} 
        filter="all"
        onToggleTodo={mockOnToggleTodo}
        onUpdateTodo={mockOnUpdateTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );
    
    expect(screen.queryByText('テストTODO 1')).not.toBeInTheDocument();
    expect(screen.getByText('更新されたTODO')).toBeInTheDocument();
  });
});