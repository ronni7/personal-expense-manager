import { CreateExpenseRequest } from '../api/create-expense-request.model';
import { UpdateExpenseRequest } from '../api/update-expense-request.model';

export interface ExpenseFormSubmit {
  id: string | null;
  request: CreateExpenseRequest | UpdateExpenseRequest;
}
