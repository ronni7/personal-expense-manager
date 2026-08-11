import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';

import { Expense } from '../model/expense.model';
import { mapExpenseDtoToExpense } from './expense.mapper';
import { MOCK_EXPENSES } from './expenses-mock';

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
}
