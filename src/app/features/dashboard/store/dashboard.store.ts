import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withProps, withHooks } from '@ngrx/signals';

import { ExpensesStore } from '../../expenses/store/expense.store';
import { CategoriesStore } from '../../categories/store/category.store';

export const DashboardStore = signalStore(
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
    totalExpensesAmountInMinorUnits: computed(() =>
      expensesStore.totalExpensesAmountInMinorUnits(),
    ),
    expenseTotal: computed(() => expensesStore.expenseTotal()),
    incomeTotal: computed(() => expensesStore.incomeTotal()),
    expenseCount: computed(() => expensesStore.expenseCount()),
    balance: computed(() => expensesStore.balance()),
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
