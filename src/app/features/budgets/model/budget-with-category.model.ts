import { Category } from '../../categories/model/category.model';
import { Budget } from './budget.model';

export interface BudgetWithCategory {
  category: Category;
  budget: Budget | null;
  spent: number;
  remaining: number;
  progress: number;
  overBudget: boolean;
}
