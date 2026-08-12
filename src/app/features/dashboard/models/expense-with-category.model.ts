import { Category } from '../../categories/model/category.model';
import { Expense } from '../../expenses/model/expense.model';

export interface ExpenseWithCategory extends Expense {
  category: Category | null;
}
