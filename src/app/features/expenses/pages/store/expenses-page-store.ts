import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { SortDirection } from '@angular/material/sort';

import { CategoriesStore } from '../../../categories/store/category.store';
import { ExpensesStore } from '../../store/expense.store';
import { ExpenseTableColumn, isExpenseTableColumn } from '../expenses-page/expense-table-columns';

interface ExpensesPageState {
  sortColumn: ExpenseTableColumn;
  sortDirection: SortDirection;
}

const initialState: ExpensesPageState = {
  sortColumn: 'date',
  sortDirection: 'desc',
};

export const ExpensesPageStore = signalStore(
  withState(initialState),

  withProps(() => ({
    expensesStore: inject(ExpensesStore),
    categoriesStore: inject(CategoriesStore),
  })),

  withHooks({
    onInit({ expensesStore, categoriesStore }) {
      expensesStore.loadExpenses();
      categoriesStore.loadCategories();
    },
  }),

  withComputed(({ expensesStore, categoriesStore }) => ({
    expenses: computed(() => expensesStore.expenses()),

    expenseCount: computed(() => expensesStore.expenseCount()),

    isLoading: computed(() => expensesStore.loading() || categoriesStore.loading()),

    error: computed(() => expensesStore.error() ?? categoriesStore.error() ?? null),

    expensesWithCategory: computed(() =>
      expensesStore.expenses().map((expense) => ({
        ...expense,
        category:
          categoriesStore.categories().find((category) => category.id === expense.categoryId) ??
          null,
      })),
    ),
  })),

  withComputed((store) => ({
    sortedExpenses: computed(() => {
      const expenses = [...store.expensesWithCategory()];
      const { sortColumn, sortDirection } = store;

      if (!sortDirection) {
        return expenses;
      }

      expenses.sort((a, b) => {
        let comparison = 0;

        switch (sortColumn()) {
          case 'date':
            comparison = a.date.localeCompare(b.date);
            break;

          case 'description':
            comparison = a.description.localeCompare(b.description);
            break;

          case 'category':
            comparison = (a.category?.name ?? '').localeCompare(b.category?.name ?? '');
            break;

          case 'amount':
            comparison = a.amountInMinorUnits - b.amountInMinorUnits;
            break;
        }

        return sortDirection() === 'asc' ? comparison : -comparison;
      });

      return expenses;
    }),
  })),

  withMethods((store) => ({
    setSort(sort: { active: string; direction: SortDirection }) {
      if (!isExpenseTableColumn(sort.active)) {
        return;
      }

      patchState(store, {
        sortColumn: sort.active,
        sortDirection: sort.direction,
      });
    },
  })),
);
