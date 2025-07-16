import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from '../../components/TodoApp';

describe('TodoApp 統合テスト', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('基本的な操作フロー', () => {
    it('TODOの追加、編集、削除が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      
      await user.type(input, '最初のタスク{Enter}');
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      
      await user.type(input, '2番目のタスク{Enter}');
      expect(screen.getByText('2番目のタスク')).toBeInTheDocument();
      
      const firstTodo = screen.getByText('最初のタスク');
      await user.dblClick(firstTodo);
      
      const editInput = screen.getByDisplayValue('最初のタスク');
      await user.clear(editInput);
      await user.type(editInput, '編集されたタスク{Enter}');
      
      expect(screen.queryByText('最初のタスク')).not.toBeInTheDocument();
      expect(screen.getByText('編集されたタスク')).toBeInTheDocument();
      
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);
      
      expect(screen.queryByText('編集されたタスク')).not.toBeInTheDocument();
      expect(screen.getByText('2番目のタスク')).toBeInTheDocument();
    });

    it('完了状態の切り替えとフィルタリングが動作する', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      await user.type(input, 'タスク1{Enter}');
      await user.type(input, 'タスク2{Enter}');
      await user.type(input, 'タスク3{Enter}');
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[2]);
      
      await user.click(screen.getByText('アクティブ'));
      expect(screen.getByText('タスク2')).toBeInTheDocument();
      expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
      expect(screen.queryByText('タスク3')).not.toBeInTheDocument();
      
      await user.click(screen.getByText('完了'));
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク3')).toBeInTheDocument();
      expect(screen.queryByText('タスク2')).not.toBeInTheDocument();
      
      await user.click(screen.getByText('すべて'));
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク2')).toBeInTheDocument();
      expect(screen.getByText('タスク3')).toBeInTheDocument();
    });

    it('完了したタスクをクリアできる', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      await user.type(input, 'アクティブなタスク{Enter}');
      await user.type(input, '完了するタスク{Enter}');
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      
      expect(screen.getByText('完了したタスクをクリア')).toBeInTheDocument();
      
      await user.click(screen.getByText('完了したタスクをクリア'));
      
      expect(screen.getByText('アクティブなタスク')).toBeInTheDocument();
      expect(screen.queryByText('完了するタスク')).not.toBeInTheDocument();
      expect(screen.queryByText('完了したタスクをクリア')).not.toBeInTheDocument();
    });
  });

  describe('統計情報の更新', () => {
    it('TODOの追加・削除に応じて統計が更新される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      expect(screen.queryByText('全体: 0件')).not.toBeInTheDocument();
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      await user.type(input, 'タスク1{Enter}');
      
      expect(screen.getByText('全体: 1件')).toBeInTheDocument();
      expect(screen.getByText('アクティブ: 1件')).toBeInTheDocument();
      expect(screen.getByText('完了: 0件')).toBeInTheDocument();
      
      await user.type(input, 'タスク2{Enter}');
      expect(screen.getByText('全体: 2件')).toBeInTheDocument();
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      
      expect(screen.getByText('アクティブ: 1件')).toBeInTheDocument();
      expect(screen.getByText('完了: 1件')).toBeInTheDocument();
      expect(screen.getByText('進捗率: 50%')).toBeInTheDocument();
    });
  });

  describe('ローカルストレージとの連携', () => {
    it('TODOがローカルストレージに保存される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      await user.type(input, '保存テスト{Enter}');
      
      await waitFor(() => {
        const stored = JSON.parse(localStorage.getItem('todos') || '[]');
        expect(stored).toHaveLength(1);
        expect(stored[0].text).toBe('保存テスト');
      });
    });

    it('ページリロード時にTODOが復元される', async () => {
      const mockTodos = [
        {
          id: '1',
          text: '保存されたタスク',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem('todos', JSON.stringify(mockTodos));
      
      render(<TodoApp />);
      
      expect(screen.getByText('保存されたタスク')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('空白のみの入力は無視される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      await user.type(input, '   {Enter}');
      
      expect(screen.getByText('TODOがありません')).toBeInTheDocument();
    });

    it('長いテキストでも正しく表示される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const longText = 'あ'.repeat(100);
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      await user.type(input, longText + '{Enter}');
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('複数のTODOを素早く追加してもすべて保存される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('新しいTODOを入力...');
      
      await user.type(input, 'タスク1{Enter}');
      await user.type(input, 'タスク2{Enter}');
      await user.type(input, 'タスク3{Enter}');
      
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク2')).toBeInTheDocument();
      expect(screen.getByText('タスク3')).toBeInTheDocument();
      expect(screen.getByText('全体: 3件')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      render(<TodoApp />);
      
      const heading = screen.getByRole('heading', { name: 'TODOアプリ' });
      expect(heading).toBeInTheDocument();
      
      const form = screen.getByRole('form', { name: '新しいTODOを追加' });
      expect(form).toBeInTheDocument();
      
      const input = screen.getByLabelText('新しいTODO');
      expect(input).toBeInTheDocument();
    });
  });
});