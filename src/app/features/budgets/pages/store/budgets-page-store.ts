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

import { Category } from '../../../categories/model/category.model';
import { CategoriesStore } from '../../../categories/store/category.store';
import { ExpensesStore } from '../../../expenses/store/expense.store';
import { Budget } from '../../model/budget.model';
import { BudgetFormRequest } from '../../model/budget-form-request.model';
import { BudgetWithCategory } from '../../model/budget-with-category.model';

import { BudgetsStore } from '../../store/budget.store';

interface BudgetsPageState {
  selectedMonth: string;
}

const initialState: BudgetsPageState = {
  selectedMonth: new Date().toISOString().slice(0, 7),
};

export const BudgetsPageStore = signalStore(
  withState(initialState),

  withProps(() => ({
    budgetsStore: inject(BudgetsStore),
    categoriesStore: inject(CategoriesStore),
    expensesStore: inject(ExpensesStore),
  })),

  withHooks({
    onInit({ budgetsStore, categoriesStore, expensesStore, selectedMonth }) {
      categoriesStore.loadCategories();
      expensesStore.loadExpenses();
      budgetsStore.loadBudgets(selectedMonth());
    },
  }),

  withComputed(({ budgetsStore, categoriesStore, expensesStore, selectedMonth }) => ({
    categories: computed(() => categoriesStore.categories()),
    currentMonthBudgets: computed(() =>
      budgetsStore.budgets().filter((budget) => budget.month === selectedMonth()),
    ),
    currentMonthExpenses: computed(() =>
      expensesStore.expenses().filter((expense) => expense.date.startsWith(selectedMonth())),
    ),

    isLoading: computed(
      () => budgetsStore.loading() || categoriesStore.loading() || expensesStore.loading(),
    ),
    error: computed(
      () => budgetsStore.error() ?? categoriesStore.error() ?? expensesStore.error() ?? null,
    ),
  })),
  withComputed((store) => ({
    totalBudget: computed(() =>
      store
        .currentMonthBudgets()
        .reduce(
          (total: number, budget: { amountInMinorUnits: number }) =>
            total + budget.amountInMinorUnits,
          0,
        ),
    ),
    totalSpent: computed(() =>
      store
        .currentMonthExpenses()
        .reduce(
          (total: number, expense: { amountInMinorUnits: number }) =>
            total + expense.amountInMinorUnits,
          0,
        ),
    ),
    isEmpty: computed(() => store.currentMonthBudgets().length === 0),
    categoryBudgetRows: computed<BudgetWithCategory[]>(() => {
      const budgetsByCategory = new Map<string, Budget>();

      for (const budget of store.currentMonthBudgets()) {
        budgetsByCategory.set(budget.categoryId, budget);
      }

      const spentByCategory = new Map<string, number>();

      for (const expense of store.currentMonthExpenses()) {
        const current = spentByCategory.get(expense.categoryId) ?? 0;
        spentByCategory.set(expense.categoryId, current + expense.amountInMinorUnits);
      }

      return store.categories().map((category: Category): BudgetWithCategory => {
        const budget = budgetsByCategory.get(category.id) ?? null;
        const spent = spentByCategory.get(category.id) ?? 0;
        const limit = budget?.amountInMinorUnits ?? 0;

        return {
          category,
          budget,
          spent,
          remaining: limit - spent,
          progress: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0,
          overBudget: spent > limit && limit > 0,
        };
      });
    }),
  })),

  withComputed((store) => ({
    remainingTotal: computed(() => store.totalBudget() - store.totalSpent()),
    percentUsed: computed(() => {
      const budget = store.totalBudget();

      if (budget <= 0) {
        return 0;
      }

      return Math.min((store.totalSpent() / budget) * 100, 100);
    }),
  })),

  withMethods((store) => ({
    setSelectedMonth(month: string) {
      if (!month) {
        return;
      }

      patchState(store, {
        selectedMonth: month,
      });

      store.budgetsStore.loadBudgets(month);
    },
    addBudget(request: BudgetFormRequest) {
      store.budgetsStore.addBudget(request);
    },
    updateBudget(id: string, request: BudgetFormRequest) {
      store.budgetsStore.updateBudget({ id, request });
    },
    deleteBudget(id: string) {
      store.budgetsStore.deleteBudget(id);
    },
  })),
);
