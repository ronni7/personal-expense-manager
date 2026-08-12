import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withProps } from '@ngrx/signals';

import { ExpensesStore } from '../../expenses/store/expense.store';
import { CategoriesStore } from '../../categories/store/category.store';

export const DashboardStore = signalStore(
  withProps(() => ({
    expensesStore: inject(ExpensesStore),
    categoriesStore: inject(CategoriesStore),
  })),

  withComputed(({ expensesStore, categoriesStore }) => ({
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
    totalAmountInMinorUnits: computed(() => expensesStore.totalAmountInMinorUnits()),
    expenseCount: computed(() => expensesStore.expenses().length),
  })),

  withComputed((store) => ({
    recentExpenses: computed(() =>
      store
        .expensesWithCategory()
        .toSorted((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    ),
  })),
);
