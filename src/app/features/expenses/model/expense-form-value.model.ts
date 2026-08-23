import { CreateExpenseRequest } from '../api/create-expense-request.model';

export interface ExpenseFormValue {
  description: string;
  amount: number | null;
  currency: 'PLN' | 'USD' | 'EUR';
  categoryId: string;
  date: string;
}

export function mapExpenseFormValueToCreateExpenseRequest(
  value: ExpenseFormValue,
): CreateExpenseRequest {
  return {
    amountInMinorUnits: Math.round((value.amount ?? 0) * 100),
    currency: value.currency,
    description: value.description.trim(),
    categoryId: value.categoryId,
    date: value.date,
  };
}
