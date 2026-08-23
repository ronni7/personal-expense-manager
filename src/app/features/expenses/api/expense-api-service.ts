import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';

import { Expense } from '../model/expense.model';
import { mapExpenseDtoToExpense } from './expense.mapper';
import { generateExpenses, MOCK_EXPENSES } from './expenses-mock';
import { CreateExpenseRequest } from './create-expense-request.model';
import { ExpenseDto } from './expense.dto';
import { CreateExpenseDto } from './create-expense-dto';

@Injectable({
  providedIn: 'root',
})
export class ExpensesApiService {
  getExpenses(): Observable<Expense[]> {
    return of(MOCK_EXPENSES).pipe(
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

    return of(createdExpense);
  }

  stressTestExpenses() {
    const EXPENSE_COUNT = 1000;
    return of(generateExpenses(EXPENSE_COUNT)).pipe(
      delay(500),
      map((expenses) => expenses.map(mapExpenseDtoToExpense)),
    );
  }
}
