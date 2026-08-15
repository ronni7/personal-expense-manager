import { computed, inject } from '@angular/core';
import { signalStore, withHooks, withProps, withComputed } from '@ngrx/signals';

import { ExpensesStore } from '../../store/expense.store';
import { CategoriesStore } from '../../../categories/store/category.store';

export const ExpensesPageStore = signalStore(
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
    isLoading: computed(() => expensesStore.loading()),
    error: computed(() => expensesStore.error()),
    expensesWithCategory: computed(() =>
      expensesStore.expenses().map((expense) => ({
        ...expense,
        category:
          categoriesStore.categories().find((category) => category.id === expense.categoryId) ??
          null,
      })),
    ),
  })),
);
