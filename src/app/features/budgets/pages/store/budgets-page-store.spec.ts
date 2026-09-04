import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, test, vi, beforeEach } from 'vitest';

import { Category } from '../../../categories/model/category.model';
import { CategoriesStore } from '../../../categories/store/category.store';
import { Expense } from '../../../expenses/model/expense.model';
import { ExpensesStore } from '../../../expenses/store/expense.store';
import { Budget } from '../../model/budget.model';
import { BudgetsStore } from '../../store/budget.store';
import { BudgetFormRequest } from '../../model/budget-form-request.model';
import { BudgetsPageStore } from './budgets-page-store';

describe('BudgetsPageStore', () => {
  const budgetsStoreMock = {
    budgets: signal<Budget[]>([]),
    loading: signal(false),
    error: signal<string | null>(null),
    addBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    loadBudgets: vi.fn().mockReturnValue(of(undefined)),
  };

  const categoriesStoreMock = {
    categories: signal<Category[]>([]),
    loading: signal(false),
    error: signal<string | null>(null),
    loadCategories: vi.fn().mockReturnValue(of(undefined)),
  };

  const expensesStoreMock = {
    expenses: signal<Expense[]>([]),
    loading: signal(false),
    error: signal<string | null>(null),
    loadExpenses: vi.fn().mockReturnValue(of(undefined)),
  };

  const categories: Category[] = [
    { id: 'food', name: 'Food' },
    { id: 'bills', name: 'Bills' },
    { id: 'transport', name: 'Transport' },
  ];

  const budgets: Budget[] = [
    {
      id: 'budget-food',
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 100000,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    },
    {
      id: 'budget-bills',
      categoryId: 'bills',
      month: '2026-08',
      amountInMinorUnits: 200000,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    },
    {
      id: 'budget-old',
      categoryId: 'food',
      month: '2026-07',
      amountInMinorUnits: 50000,
      createdAt: '2026-07-01',
      updatedAt: '2026-07-01',
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'expense-food-1',
      categoryId: 'food',
      amountInMinorUnits: 30000,
      currency: 'PLN',
      date: '2026-08-10',
      description: 'Groceries',
      createdAt: '2026-08-10',
      updatedAt: '2026-08-10',
    },
    {
      id: 'expense-food-2',
      categoryId: 'food',
      amountInMinorUnits: 20000,
      currency: 'PLN',
      date: '2026-08-15',
      description: 'Restaurant',
      createdAt: '2026-08-15',
      updatedAt: '2026-08-15',
    },
    {
      id: 'expense-bills',
      categoryId: 'bills',
      amountInMinorUnits: 50000,
      currency: 'PLN',
      date: '2026-08-05',
      description: 'Electricity',
      createdAt: '2026-08-05',
      updatedAt: '2026-08-05',
    },
    {
      id: 'expense-old',
      categoryId: 'food',
      amountInMinorUnits: 100000,
      currency: 'PLN',
      date: '2026-07-31',
      description: 'Old expense',
      createdAt: '2026-07-31',
      updatedAt: '2026-07-31',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    budgetsStoreMock.budgets.set([]);
    budgetsStoreMock.loading.set(false);
    budgetsStoreMock.error.set(null);

    categoriesStoreMock.categories.set([]);
    categoriesStoreMock.loading.set(false);
    categoriesStoreMock.error.set(null);

    expensesStoreMock.expenses.set([]);
    expensesStoreMock.loading.set(false);
    expensesStoreMock.error.set(null);

    TestBed.configureTestingModule({
      providers: [
        BudgetsPageStore,
        {
          provide: BudgetsStore,
          useValue: budgetsStoreMock,
        },
        {
          provide: CategoriesStore,
          useValue: categoriesStoreMock,
        },
        {
          provide: ExpensesStore,
          useValue: expensesStoreMock,
        },
      ],
    });
  });

  function createStore() {
    return TestBed.inject(BudgetsPageStore);
  }

  function setData() {
    budgetsStoreMock.budgets.set(budgets);
    categoriesStoreMock.categories.set(categories);
    expensesStoreMock.expenses.set(expenses);
  }

  test('should initialize selected month', () => {
    const store = createStore();

    expect(store.selectedMonth()).toBe(new Date().toISOString().slice(0, 7));
  });

  test('should load budgets, categories and expenses on initialization', () => {
    createStore();
    expect(budgetsStoreMock.loadBudgets).toHaveBeenCalledWith(new Date().toISOString().slice(0, 7));
  });

  test('should expose categories from CategoriesStore', () => {
    const store = createStore();
    categoriesStoreMock.categories.set(categories);

    expect(store.categories()).toEqual(categories);
  });

  test('should filter budgets by selected month', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.currentMonthBudgets()).toEqual([budgets[0], budgets[1]]);
  });

  test('should filter expenses by selected month', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.currentMonthExpenses()).toEqual([expenses[0], expenses[1], expenses[2]]);
  });

  test('should calculate total budget for selected month', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.totalBudget()).toBe(300000);
  });

  test('should calculate total spent for selected month', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.totalSpent()).toBe(100000);
  });

  test('should calculate remaining total', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.remainingTotal()).toBe(200000);
  });

  test('should calculate percent used', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.percentUsed()).toBeCloseTo(33.333333);
  });

  test('should cap percent used at 100', () => {
    const store = createStore();
    setData();

    budgetsStoreMock.budgets.set([
      {
        ...budgets[0],
        amountInMinorUnits: 50000,
      },
    ]);

    expensesStoreMock.expenses.set([
      {
        ...expenses[0],
        amountInMinorUnits: 100000,
      },
    ]);

    store.setSelectedMonth('2026-08');

    expect(store.percentUsed()).toBe(100);
  });

  test('should return zero percent used when there is no budget', () => {
    const store = createStore();

    budgetsStoreMock.budgets.set([]);
    expensesStoreMock.expenses.set(expenses);

    store.setSelectedMonth('2026-08');

    expect(store.percentUsed()).toBe(0);
  });

  test('should report empty when selected month has no budgets', () => {
    const store = createStore();

    budgetsStoreMock.budgets.set([
      {
        ...budgets[0],
        month: '2026-07',
      },
    ]);

    store.setSelectedMonth('2026-08');

    expect(store.isEmpty()).toBe(true);
  });

  test('should report not empty when selected month has budgets', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.isEmpty()).toBe(false);
  });

  test('should combine loading state from all dependent stores', () => {
    const store = createStore();

    expect(store.isLoading()).toBe(false);

    budgetsStoreMock.loading.set(true);
    expect(store.isLoading()).toBe(true);

    budgetsStoreMock.loading.set(false);
    categoriesStoreMock.loading.set(true);
    expect(store.isLoading()).toBe(true);

    categoriesStoreMock.loading.set(false);
    expensesStoreMock.loading.set(true);
    expect(store.isLoading()).toBe(true);

    expensesStoreMock.loading.set(false);
    expect(store.isLoading()).toBe(false);
  });

  test('should expose the first available error from dependent stores', () => {
    const store = createStore();

    budgetsStoreMock.error.set('Budget error');
    categoriesStoreMock.error.set('Category error');
    expensesStoreMock.error.set('Expense error');

    expect(store.error()).toBe('Budget error');

    budgetsStoreMock.error.set(null);
    expect(store.error()).toBe('Category error');

    categoriesStoreMock.error.set(null);
    expect(store.error()).toBe('Expense error');

    expensesStoreMock.error.set(null);
    expect(store.error()).toBeNull();
  });

  test('should build category budget rows', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    expect(store.categoryBudgetRows()).toEqual([
      {
        category: categories[0],
        budget: budgets[0],
        spent: 50000,
        remaining: 50000,
        progress: 50,
        overBudget: false,
      },
      {
        category: categories[1],
        budget: budgets[1],
        spent: 50000,
        remaining: 150000,
        progress: 25,
        overBudget: false,
      },
      {
        category: categories[2],
        budget: null,
        spent: 0,
        remaining: 0,
        progress: 0,
        overBudget: false,
      },
    ]);
  });

  test('should ignore expenses from other months in category rows', () => {
    const store = createStore();
    setData();

    store.setSelectedMonth('2026-08');

    const foodRow = store.categoryBudgetRows().find((row) => row.category.id === 'food');

    expect(foodRow?.spent).toBe(50000);
  });

  test('should ignore budgets from other months in category rows', () => {
    const store = createStore();

    categoriesStoreMock.categories.set([categories[0]]);

    budgetsStoreMock.budgets.set([
      {
        ...budgets[0],
        month: '2026-07',
      },
    ]);

    expensesStoreMock.expenses.set([]);

    store.setSelectedMonth('2026-08');

    const foodRow = store.categoryBudgetRows()[0];

    expect(foodRow.budget).toBeNull();
    expect(foodRow.spent).toBe(0);
    expect(foodRow.remaining).toBe(0);
  });

  test('should calculate over budget state', () => {
    const store = createStore();

    categoriesStoreMock.categories.set([categories[0]]);
    budgetsStoreMock.budgets.set([
      {
        ...budgets[0],
        amountInMinorUnits: 50000,
      },
    ]);
    expensesStoreMock.expenses.set([
      {
        ...expenses[0],
        amountInMinorUnits: 75000,
      },
    ]);

    store.setSelectedMonth('2026-08');

    expect(store.categoryBudgetRows()[0]).toEqual({
      category: categories[0],
      budget: {
        ...budgets[0],
        amountInMinorUnits: 50000,
      },
      spent: 75000,
      remaining: -25000,
      progress: 100,
      overBudget: true,
    });
  });

  test('should update selected month and reload budgets', () => {
    const store = createStore();

    store.setSelectedMonth('2026-09');

    expect(store.selectedMonth()).toBe('2026-09');
    expect(budgetsStoreMock.loadBudgets).toHaveBeenCalledWith('2026-09');
  });

  test('should ignore empty selected month', () => {
    const store = createStore();

    expect(budgetsStoreMock.loadBudgets).toHaveBeenCalledTimes(1);

    store.setSelectedMonth('');

    expect(store.selectedMonth()).toBe(new Date().toISOString().slice(0, 7));

    expect(budgetsStoreMock.loadBudgets).toHaveBeenCalledTimes(1);
  });

  test('should delegate add budget to BudgetsStore', () => {
    const store = createStore();

    const request: BudgetFormRequest = {
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 50000,
    };

    store.addBudget(request);

    expect(budgetsStoreMock.addBudget).toHaveBeenCalledWith(request);
  });

  test('should delegate update budget to BudgetsStore', () => {
    const store = createStore();

    const request: BudgetFormRequest = {
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 75000,
    };

    store.updateBudget('budget-food', request);

    expect(budgetsStoreMock.updateBudget).toHaveBeenCalledWith({
      id: 'budget-food',
      request,
    });
  });

  test('should delegate delete budget to BudgetsStore', () => {
    const store = createStore();

    store.deleteBudget('budget-food');

    expect(budgetsStoreMock.deleteBudget).toHaveBeenCalledWith('budget-food');
  });
});
