import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../TodoItem';
import { mockTodos } from '../../__fixtures__/todo/testData';

describe('TodoItem', () => {
  const mockOnToggle = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockTodo = mockTodos[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされる', () => {
    render(
      <TodoItem 
        todo={mockTodo} 
        onToggle={mockOnToggle} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(mockTodo.text)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  it('完了したTODOは取り消し線が表示される', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(
      <TodoItem 
        todo={completedTodo} 
        onToggle={mockOnToggle} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    const todoText = screen.getByText(completedTodo.text);
    expect(todoText).toHaveClass('line-through');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('チェックボックスをクリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem 
        todo={mockTodo} 
        onToggle={mockOnToggle} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockOnToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem 
        todo={mockTodo} 
        onToggle={mockOnToggle} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByText('削除');
    await user.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  describe('編集機能', () => {
    it('ダブルクリックで編集モードになる', async () => {
      const user = userEvent.setup();
      render(
        <TodoItem 
          todo={mockTodo} 
          onToggle={mockOnToggle} 
          onUpdate={mockOnUpdate} 
          onDelete={mockOnDelete}
        />
      );
      
      const todoText = screen.getByText(mockTodo.text);
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue(mockTodo.text);
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('編集してEnterキーで更新される', async () => {
      const user = userEvent.setup();
      render(
        <TodoItem 
          todo={mockTodo} 
          onToggle={mockOnToggle} 
          onUpdate={mockOnUpdate} 
          onDelete={mockOnDelete}
        />
      );
      
      const todoText = screen.getByText(mockTodo.text);
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue(mockTodo.text);
      await user.clear(input);
      await user.type(input, '更新されたTODO{Enter}');
      
      expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, '更新されたTODO');
    });

    it('Escapeキーで編集をキャンセルできる', async () => {
      const user = userEvent.setup();
      render(
        <TodoItem 
          todo={mockTodo} 
          onToggle={mockOnToggle} 
          onUpdate={mockOnUpdate} 
          onDelete={mockOnDelete}
        />
      );
      
      const todoText = screen.getByText(mockTodo.text);
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue(mockTodo.text);
      await user.clear(input);
      await user.type(input, '変更したテキスト{Escape}');
      
      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(screen.getByText(mockTodo.text)).toBeInTheDocument();
    });

    it('空白のみの更新は無視される', async () => {
      const user = userEvent.setup();
      render(
        <TodoItem 
          todo={mockTodo} 
          onToggle={mockOnToggle} 
          onUpdate={mockOnUpdate} 
          onDelete={mockOnDelete}
        />
      );
      
      const todoText = screen.getByText(mockTodo.text);
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue(mockTodo.text);
      await user.clear(input);
      await user.type(input, '   {Enter}');
      
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('onBlurで編集が確定される', async () => {
      const user = userEvent.setup();
      render(
        <TodoItem 
          todo={mockTodo} 
          onToggle={mockOnToggle} 
          onUpdate={mockOnUpdate} 
          onDelete={mockOnDelete}
        />
      );
      
      const todoText = screen.getByText(mockTodo.text);
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue(mockTodo.text);
      await user.clear(input);
      await user.type(input, '新しいテキスト');
      
      fireEvent.blur(input);
      
      expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, '新しいテキスト');
    });
  });

  it('アクセシビリティ属性が正しく設定されている', () => {
    render(
      <TodoItem 
        todo={mockTodo} 
        onToggle={mockOnToggle} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', `${mockTodo.text}を完了にする`);
  });

  it('オプショナルなコールバックを省略してもエラーにならない', () => {
    render(<TodoItem todo={mockTodo} />);
    
    expect(screen.getByText(mockTodo.text)).toBeInTheDocument();
  });
});