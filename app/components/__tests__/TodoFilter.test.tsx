import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoFilter from '../TodoFilter';

describe('TodoFilter', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('すべてのフィルターボタンが表示される', () => {
    render(<TodoFilter filter="all" onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('アクティブ')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('現在のフィルターがアクティブな状態で表示される', () => {
    render(<TodoFilter filter="active" onFilterChange={mockOnFilterChange} />);
    
    const activeButton = screen.getByText('アクティブ');
    expect(activeButton).toHaveClass('bg-blue-500');
    expect(activeButton).toHaveClass('text-white');
    
    const allButton = screen.getByText('すべて');
    expect(allButton).toHaveClass('bg-gray-200');
    expect(allButton).toHaveClass('text-gray-700');
  });

  it('フィルターボタンをクリックするとonFilterChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<TodoFilter filter="all" onFilterChange={mockOnFilterChange} />);
    
    await user.click(screen.getByText('アクティブ'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('active');
    
    await user.click(screen.getByText('完了'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
    
    await user.click(screen.getByText('すべて'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('現在のフィルターをクリックしてもonFilterChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<TodoFilter filter="all" onFilterChange={mockOnFilterChange} />);
    
    await user.click(screen.getByText('すべて'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('異なるフィルター値でも正しくレンダリングされる', () => {
    const { rerender } = render(<TodoFilter filter="all" onFilterChange={mockOnFilterChange} />);
    
    rerender(<TodoFilter filter="completed" onFilterChange={mockOnFilterChange} />);
    
    const completedButton = screen.getByText('完了');
    expect(completedButton).toHaveClass('bg-blue-500');
    expect(completedButton).toHaveClass('text-white');
  });
});