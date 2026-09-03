import { Category } from '../../categories/model/category.model';
import { Budget } from './budget.model';

export interface BudgetDialogData {
  budget: Budget | null;
  categories: Category[];
}
