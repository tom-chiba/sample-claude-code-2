import { Todo } from '../../types/todo';

export const mockTodos: Todo[] = [
  {
    id: '1',
    text: 'テストTODO 1',
    completed: false,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: '2',
    text: 'テストTODO 2',
    completed: true,
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  },
  {
    id: '3',
    text: 'テストTODO 3',
    completed: false,
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-03T00:00:00Z'),
  },
];

export const testIds = {
  app: 'todo-app',
  input: 'todo-input',
  inputField: 'todo-input-field',
  list: 'todo-list',
  item: 'todo-item',
  itemText: 'todo-item-text',
  itemCheckbox: 'todo-item-checkbox',
  itemDelete: 'todo-item-delete',
  filter: 'todo-filter',
  filterAll: 'filter-all',
  filterActive: 'filter-active',
  filterCompleted: 'filter-completed',
  stats: 'todo-stats',
  clearCompleted: 'clear-completed',
};

export const mockData = {
  valid: {
    newTodoText: '新しいTODO',
    updateTodoText: '更新されたTODO',
    emptyText: '',
    longText: 'あ'.repeat(100),
  },
  invalid: {
    onlySpaces: '   ',
    specialChars: '<script>alert("XSS")</script>',
  },
};