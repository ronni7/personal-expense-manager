export const EXPENSE_TABLE_COLUMNS = ['date', 'description', 'category', 'amount'] as const;

export type ExpenseTableColumn = (typeof EXPENSE_TABLE_COLUMNS)[number];

export interface ExpenseSort {
  column: ExpenseTableColumn;
  direction: 'asc' | 'desc';
}

export function isExpenseTableColumn(value: string): value is ExpenseTableColumn {
  return (EXPENSE_TABLE_COLUMNS as readonly string[]).includes(value);
}
