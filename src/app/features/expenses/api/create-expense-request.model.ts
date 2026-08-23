export interface CreateExpenseRequest {
  amountInMinorUnits: number;
  currency: 'PLN' | 'USD' | 'EUR';
  description: string;
  categoryId: string;
  date: string;
}
