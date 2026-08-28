export interface UpdateExpenseRequest {
  amountInMinorUnits: number;
  currency: 'PLN' | 'USD' | 'EUR';
  description: string;
  categoryId: string;
  date: string;
}
