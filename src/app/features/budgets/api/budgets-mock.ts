import { BudgetDto } from './budget.dto';

export const MOCK_BUDGETS: BudgetDto[] = [
  {
    id: 'budget-food',
    categoryId: 'food',
    month: '2026-08',
    amountInMinorUnits: 180000,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'budget-bills',
    categoryId: 'bills',
    month: '2026-08',
    amountInMinorUnits: 240000,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'budget-transport',
    categoryId: 'transport',
    month: '2026-08',
    amountInMinorUnits: 120000,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
];
