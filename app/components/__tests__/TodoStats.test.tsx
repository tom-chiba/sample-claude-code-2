import { render, screen } from '@testing-library/react';
import TodoStats from '../TodoStats';
import { mockTodos } from '../../__fixtures__/todo/testData';

describe('TodoStats', () => {
  it('TODOが0件の場合は何も表示されない', () => {
    const { container } = render(<TodoStats todos={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('統計情報が正しく表示される', () => {
    render(<TodoStats todos={mockTodos} />);
    
    expect(screen.getByText('全体: 3件')).toBeInTheDocument();
    expect(screen.getByText('アクティブ: 2件')).toBeInTheDocument();
    expect(screen.getByText('完了: 1件')).toBeInTheDocument();
  });

  it('進捗率が正しく計算される', () => {
    render(<TodoStats todos={mockTodos} />);
    
    expect(screen.getByText('進捗率: 33%')).toBeInTheDocument();
  });

  it('進捗バーの幅が正しく設定される', () => {
    render(<TodoStats todos={mockTodos} />);
    
    const progressBar = screen.getByText('進捗率: 33%')
      .closest('div')
      ?.querySelector('.bg-green-500');
    
    expect(progressBar).toHaveStyle({ width: '33.33333333333333%' });
  });

  it('すべて完了の場合は100%と表示される', () => {
    const allCompleted = mockTodos.map(todo => ({ ...todo, completed: true }));
    render(<TodoStats todos={allCompleted} />);
    
    expect(screen.getByText('全体: 3件')).toBeInTheDocument();
    expect(screen.getByText('アクティブ: 0件')).toBeInTheDocument();
    expect(screen.getByText('完了: 3件')).toBeInTheDocument();
    expect(screen.getByText('進捗率: 100%')).toBeInTheDocument();
  });

  it('すべて未完了の場合は進捗バーが表示されない', () => {
    const allActive = mockTodos.map(todo => ({ ...todo, completed: false }));
    render(<TodoStats todos={allActive} />);
    
    expect(screen.getByText('全体: 3件')).toBeInTheDocument();
    expect(screen.getByText('アクティブ: 3件')).toBeInTheDocument();
    expect(screen.getByText('完了: 0件')).toBeInTheDocument();
    expect(screen.queryByText(/進捗率:/)).not.toBeInTheDocument();
  });

  it('1件のTODOでも正しく表示される', () => {
    render(<TodoStats todos={[mockTodos[0]]} />);
    
    expect(screen.getByText('全体: 1件')).toBeInTheDocument();
    expect(screen.getByText('アクティブ: 1件')).toBeInTheDocument();
    expect(screen.getByText('完了: 0件')).toBeInTheDocument();
  });
});