import { BudgetFormRequest } from './budget-form-request.model';

export interface BudgetFormSubmit {
  id: string | null;
  request: BudgetFormRequest;
}
