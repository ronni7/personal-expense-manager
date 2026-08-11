import { ExpenseDto } from './expense.dto';

export const MOCK_EXPENSES: ExpenseDto[] = [
  {
    id: 'expense-1',
    amountInMinorUnits: 4599,
    currency: 'PLN',
    description: 'Groceries',
    categoryId: 'food',
    date: '2026-08-10T18:30:00Z',
    createdAt: '2026-08-10T18:30:00Z',
    updatedAt: '2026-08-10T18:30:00Z',
  },
  {
    id: 'expense-2',
    amountInMinorUnits: 12500,
    currency: 'PLN',
    description: 'Electricity bill',
    categoryId: 'bills',
    date: '2026-08-08T09:00:00Z',
    createdAt: '2026-08-08T09:00:00Z',
    updatedAt: '2026-08-08T09:00:00Z',
  },
  {
    id: 'expense-3',
    amountInMinorUnits: 1599,
    currency: 'PLN',
    description: 'Coffee',
    categoryId: 'food',
    date: '2026-08-07T07:45:00Z',
    createdAt: '2026-08-07T07:45:00Z',
    updatedAt: '2026-08-07T07:45:00Z',
  },
];
