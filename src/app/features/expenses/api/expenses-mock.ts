import { ExpenseDto } from './expense.dto';

export const MOCK_EXPENSES: ExpenseDto[] = [
  {
    id: 'expense-1',
    amountInMinorUnits: 4599,
    currency: 'PLN',
    description: 'Groceries',
    categoryId: 'food',
    date: '2026-08-10',
    createdAt: '2026-08-10T18:30:00Z',
    updatedAt: '2026-08-10T18:30:00Z',
  },
  {
    id: 'expense-2',
    amountInMinorUnits: 12500,
    currency: 'PLN',
    description: 'Electricity bill',
    categoryId: 'bills',
    date: '2026-08-08',
    createdAt: '2026-08-08T09:00:00Z',
    updatedAt: '2026-08-08T09:00:00Z',
  },
  {
    id: 'expense-3',
    amountInMinorUnits: 1599,
    currency: 'PLN',
    description: 'Coffee',
    categoryId: 'food',
    date: '2026-08-07',
    createdAt: '2026-08-07T07:45:00Z',
    updatedAt: '2026-08-07T07:45:00Z',
  },
];

export const generateExpenses = (count: number): ExpenseDto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `stress-${index}`,
    currency: 'PLN',
    description: `Expense ${index}`,
    amountInMinorUnits: 1000 + (index % 5000),
    categoryId: ['food', 'transport', 'home', 'other'][index % 4],
    date: new Date(2026, index % 12, (index % 28) + 1).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
