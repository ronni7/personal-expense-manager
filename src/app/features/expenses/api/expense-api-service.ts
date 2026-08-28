import { Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';

import { Expense } from '../model/expense.model';
import { mapExpenseDtoToExpense } from './expense.mapper';
import { generateExpenses, MOCK_EXPENSES } from './expenses-mock';
import { CreateExpenseRequest } from './create-expense-request.model';
import { ExpenseDto } from './expense.dto';
import { CreateExpenseDto } from './create-expense-dto';
import { UpdateExpenseRequest } from './update-expense-request.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesApiService {
  private expenses: ExpenseDto[] = [...MOCK_EXPENSES];
  getExpenses(): Observable<Expense[]> {
    return of([...this.expenses]).pipe(
      delay(500),
      map((expenses) => expenses.map(mapExpenseDtoToExpense)),
    );
  }

  createExpense(expense: CreateExpenseRequest): Observable<ExpenseDto> {
    const now = new Date().toISOString();
    const createdExpense: CreateExpenseDto = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.expenses.push(createdExpense);

    return of(createdExpense);
  }
  updateExpense(id: string, request: UpdateExpenseRequest): Observable<ExpenseDto> {
    const index = this.expenses.findIndex((expense) => expense.id === id);

    if (index === -1) {
      return throwError(() => new Error('Expense not found'));
    }

    const updatedExpense: ExpenseDto = {
      ...this.expenses[index],
      ...request,
      updatedAt: new Date().toISOString(),
    };

    this.expenses[index] = updatedExpense;

    return of(updatedExpense);
  }
  stressTestExpenses() {
    const EXPENSE_COUNT = 1000;
    return of(generateExpenses(EXPENSE_COUNT)).pipe(
      delay(500),
      map((expenses) => expenses.map(mapExpenseDtoToExpense)),
    );
  }
}
