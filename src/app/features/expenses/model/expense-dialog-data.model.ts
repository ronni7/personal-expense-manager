import { Category } from '../../categories/model/category.model';
import { Expense } from './expense.model';

export interface ExpenseDialogData {
  expense: Expense;
  categories: Category[];
}
