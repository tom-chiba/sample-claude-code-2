import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoInput from '../TodoInput';

describe('TodoInput', () => {
  const mockOnAddTodo = jest.fn();

  beforeEach(() => {
    mockOnAddTodo.mockClear();
  });

  it('正しくレンダリングされる', () => {
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByPlaceholderText('新しいTODOを入力...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('maxLength', '200');
  });

  it('テキストを入力できる', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByPlaceholderText('新しいTODOを入力...');
    await user.type(input, 'テストTODO');
    
    expect(input).toHaveValue('テストTODO');
  });

  it('Enterキーで送信される', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByPlaceholderText('新しいTODOを入力...');
    await user.type(input, 'テストTODO{Enter}');
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('テストTODO');
    expect(input).toHaveValue('');
  });

  it('フォーム送信でTODOが追加される', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByPlaceholderText('新しいTODOを入力...');
    const form = screen.getByRole('form', { name: '新しいTODOを追加' });
    
    await user.type(input, '新しいタスク');
    fireEvent.submit(form);
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('新しいタスク');
    expect(input).toHaveValue('');
  });

  it('空白のみの入力は無視される', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByPlaceholderText('新しいTODOを入力...');
    await user.type(input, '   {Enter}');
    
    expect(mockOnAddTodo).not.toHaveBeenCalled();
  });

  it('前後の空白は除去される', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByPlaceholderText('新しいTODOを入力...');
    await user.type(input, '  テスト  {Enter}');
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('テスト');
  });

  it('アクセシビリティ属性が正しく設定されている', () => {
    render(<TodoInput onAddTodo={mockOnAddTodo} />);
    
    const input = screen.getByLabelText('新しいTODO');
    const form = screen.getByRole('form', { name: '新しいTODOを追加' });
    
    expect(input).toBeInTheDocument();
    expect(form).toBeInTheDocument();
  });
});