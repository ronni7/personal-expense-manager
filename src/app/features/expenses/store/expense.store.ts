import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ExpensesApiService } from '../api/expense-api-service';
import { Expense } from '../model/expense.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CreateExpenseRequest } from '../api/create-expense-request.model';
import { mapExpenseDtoToExpense } from '../api/expense.mapper';

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  createError: string | null;
}

const initialState: ExpensesState = {
  expenses: [] as Expense[],
  loading: false,
  creating: false,
  error: null,
  createError: null,
};

export const ExpensesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ expenses }) => ({
    expenseCount: computed(() => expenses().length),

    expenseTotal: computed(() =>
      expenses()
        .filter((expense) => expense.amountInMinorUnits > 0)
        .reduce((total, expense) => total + expense.amountInMinorUnits, 0),
    ),

    incomeTotal: computed(() =>
      expenses()
        .filter((expense) => expense.amountInMinorUnits < 0)
        .reduce((total, expense) => total + Math.abs(expense.amountInMinorUnits), 0),
    ),
    totalExpensesAmountInMinorUnits: computed(() =>
      expenses().reduce((total, expense) => total + expense.amountInMinorUnits, 0),
    ),
  })),
  withComputed((store) => ({
    balance: computed(() => {
      return store.incomeTotal() - store.expenseTotal();
    }),
  })),

  withMethods((store, expensesApi = inject(ExpensesApiService)) => ({
    loadExpenses: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            loading: true,
            error: null,
          });
        }),
        switchMap(() => expensesApi.getExpenses()),
        tapResponse({
          next: (expenses) => {
            patchState(store, {
              expenses,
              loading: false,
            });
          },
          error: () => {
            patchState(store, {
              loading: false,
              error: 'Failed to load expenses.',
            });
          },
        }),
      ),
    ),
    addExpense: rxMethod<CreateExpenseRequest>(
      pipe(
        tap(() => {
          patchState(store, {
            creating: true,
            createError: null,
          });
        }),

        switchMap((request) =>
          expensesApi.createExpense(request).pipe(
            tapResponse({
              next: (dto) => {
                const expense = mapExpenseDtoToExpense(dto);

                patchState(store, (state) => ({
                  expenses: [...state.expenses, expense],
                  creating: false,
                }));
              },

              error: () => {
                patchState(store, {
                  creating: false,
                  createError: 'Failed to create expense.',
                });
              },
            }),
          ),
        ),
      ),
    ),
  })),
);
