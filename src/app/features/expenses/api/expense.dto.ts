export interface ExpenseDto {
  id: string;
  amountInMinorUnits: number;
  currency: 'PLN' | 'USD' | 'EUR';
  description: string;
  categoryId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
