import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { BudgetDto } from './budget.dto';
import { CreateBudgetRequest } from './create-budget-request.model';
import { UpdateBudgetRequest } from './update-budget-request.model';
import { MOCK_BUDGETS } from './budgets-mock';

@Injectable({
  providedIn: 'root',
})
export class BudgetsApiService {
  private budgets: BudgetDto[] = [...MOCK_BUDGETS];

  getBudgets(month?: string): Observable<BudgetDto[]> {
    const filteredBudgets = month
      ? this.budgets.filter((budget) => budget.month === month)
      : [...this.budgets];

    return of(filteredBudgets);
  }

  createBudget(request: CreateBudgetRequest): Observable<BudgetDto> {
    const now = new Date().toISOString();
    const createdBudget: BudgetDto = {
      ...request,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.budgets.push(createdBudget);

    return of(createdBudget);
  }

  updateBudget(id: string, request: UpdateBudgetRequest): Observable<BudgetDto> {
    const index = this.budgets.findIndex((budget) => budget.id === id);

    if (index === -1) {
      return throwError(() => new Error('Budget not found'));
    }

    const updatedBudget: BudgetDto = {
      ...this.budgets[index],
      ...request,
      updatedAt: new Date().toISOString(),
    };

    this.budgets[index] = updatedBudget;

    return of(updatedBudget);
  }

  deleteBudget(id: string): Observable<void> {
    const index = this.budgets.findIndex((budget) => budget.id === id);

    if (index === -1) {
      return throwError(() => new Error('Budget not found'));
    }

    this.budgets.splice(index, 1);

    return of(undefined);
  }
}
