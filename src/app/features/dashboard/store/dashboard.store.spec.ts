import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoriesStore } from '../../categories/store/category.store';
import { ExpensesStore } from '../../expenses/store/expense.store';
import { DashboardStore } from './dashboard.store';
import { Expense } from '../../expenses/model/expense.model';
import { Category } from '../../categories/model/category.model';
const expenses: Expense[] = [
  {
    id: '1',
    categoryId: 'food',
    description: 'Groceries',
    amountInMinorUnits: 4_500,
    date: '2026-08-10',
    currency: 'PLN',
    createdAt: '2026-08-10T18:30:00Z',
    updatedAt: '2026-08-10T18:30:00Z',
  },
  {
    id: '2',
    categoryId: 'bills',
    description: 'Electricity',
    amountInMinorUnits: 12_000,
    date: '2026-08-09',
    currency: 'PLN',
    createdAt: '2026-08-12T18:30:00Z',
    updatedAt: '2026-08-10T18:30:00Z',
  },
];
const categories: Category[] = [
  {
    id: 'food',
    name: 'Food',
  },
  {
    id: 'bills',
    name: 'Bills',
  },
];
describe('DashboardStore', () => {
  const expensesStoreMock = {
    expenses: signal<Expense[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    expenseTotal: signal<number>(0),
    incomeTotal: signal<number>(0),
    expenseCount: signal<number>(0),
    balance: signal<number>(0),
    totalExpensesAmountInMinorUnits: signal<number>(0),
    loadExpenses: vi.fn(),
  };

  const categoriesStoreMock = {
    categories: signal<Category[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    loadCategories: vi.fn(),
  };

  beforeEach(() => {
    expensesStoreMock.expenses.set([]);
    expensesStoreMock.loading.set(false);
    expensesStoreMock.error.set(null);
    expensesStoreMock.expenseTotal.set(0);
    expensesStoreMock.incomeTotal.set(0);
    expensesStoreMock.expenseCount.set(0);
    expensesStoreMock.balance.set(0);
    expensesStoreMock.totalExpensesAmountInMinorUnits.set(0);

    categoriesStoreMock.categories.set([]);
    categoriesStoreMock.loading.set(false);
    categoriesStoreMock.error.set(null);

    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        {
          provide: ExpensesStore,
          useValue: expensesStoreMock,
        },
        {
          provide: CategoriesStore,
          useValue: categoriesStoreMock,
        },
      ],
    });

    vi.clearAllMocks();
  });

  it('should load expenses and categories on initialization', () => {
    TestBed.inject(DashboardStore);

    expect(expensesStoreMock.loadExpenses).toHaveBeenCalledOnce();
    expect(categoriesStoreMock.loadCategories).toHaveBeenCalledOnce();
  });

  it('should expose financial data from ExpensesStore', () => {
    expensesStoreMock.expenseTotal.set(12_000);
    expensesStoreMock.incomeTotal.set(50_000);
    expensesStoreMock.balance.set(38_000);
    expensesStoreMock.expenseCount.set(4);
    expensesStoreMock.totalExpensesAmountInMinorUnits.set(12_000);

    const store = TestBed.inject(DashboardStore);

    expect(store.expenseTotal()).toBe(12_000);
    expect(store.incomeTotal()).toBe(50_000);
    expect(store.balance()).toBe(38_000);
    expect(store.expenseCount()).toBe(4);
    expect(store.totalExpensesAmountInMinorUnits()).toBe(12_000);
  });

  it('should update financial data when ExpensesStore state changes', () => {
    const store = TestBed.inject(DashboardStore);

    expect(store.incomeTotal()).toBe(0);
    expect(store.expenseTotal()).toBe(0);
    expect(store.balance()).toBe(0);

    expensesStoreMock.incomeTotal.set(50_000);
    expensesStoreMock.expenseTotal.set(12_000);
    expensesStoreMock.balance.set(38_000);

    expect(store.incomeTotal()).toBe(50_000);
    expect(store.expenseTotal()).toBe(12_000);
    expect(store.balance()).toBe(38_000);
  });

  it('should combine expenses with their categories', () => {
    expensesStoreMock.expenses.set(expenses);
    categoriesStoreMock.categories.set(categories);

    const store = TestBed.inject(DashboardStore);

    expect(store.expensesWithCategory()).toEqual([
      {
        ...expenses[0],
        category: categories[0],
      },
      {
        ...expenses[1],
        category: categories[1],
      },
    ]);
  });
  it('should set category to null when expense category does not exist', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        categoryId: 'unknown',
        description: 'Something',
        amountInMinorUnits: 1_000,
        date: '2026-08-10',
        currency: 'PLN',
        createdAt: '2026-08-12T18:30:00Z',
        updatedAt: '2026-08-10T18:30:00Z',
      },
    ];

    categoriesStoreMock.categories.set([]);

    expensesStoreMock.expenses.set(expenses);

    const store = TestBed.inject(DashboardStore);

    expect(store.expensesWithCategory()).toEqual([
      {
        ...expenses[0],
        category: null,
      },
    ]);
  });
  it('should return recent expenses sorted by date descending', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        description: 'Older expense',
        amountInMinorUnits: 1000,
        categoryId: 'food',
        date: '2026-08-05',
        currency: 'PLN',
        createdAt: '2026-08-12T18:30:00Z',
        updatedAt: '2026-08-10T18:30:00Z',
      },
      {
        id: '2',
        description: 'Newest expense',
        amountInMinorUnits: 2000,
        categoryId: 'food',
        date: '2026-08-12',
        currency: 'PLN',
        createdAt: '2026-08-12T18:30:00Z',
        updatedAt: '2026-08-10T18:30:00Z',
      },
      {
        id: '3',
        description: 'Middle expense',
        amountInMinorUnits: 3000,
        categoryId: 'food',
        date: '2026-08-10',
        currency: 'PLN',
        createdAt: '2026-08-12T18:30:00Z',
        updatedAt: '2026-08-10T18:30:00Z',
      },
    ];

    expensesStoreMock.expenses.set(expenses);

    const store = TestBed.inject(DashboardStore);

    expect(store.recentExpenses().map((expense) => expense.id)).toEqual(['2', '3', '1']);
  });

  it('should return at most five recent expenses', () => {
    const expenses: Expense[] = Array.from({ length: 7 }, (_, index) => ({
      id: `${index + 1}`,
      description: `Expense ${index + 1}`,
      amountInMinorUnits: 1000,
      categoryId: 'food',
      date: `2026-08-${String(index + 1).padStart(2, '0')}`,
      currency: 'PLN',
      createdAt: '2026-08-12T18:30:00Z',
      updatedAt: '2026-08-10T18:30:00Z',
    }));

    expensesStoreMock.expenses.set(expenses);

    const store = TestBed.inject(DashboardStore);

    expect(store.recentExpenses()).toHaveLength(5);
  });
  it('should be loading when expenses or categories are loading', () => {
    const store = TestBed.inject(DashboardStore);

    expect(store.isLoading()).toBe(false);

    expensesStoreMock.loading.set(true);
    expect(store.isLoading()).toBe(true);

    expensesStoreMock.loading.set(false);
    categoriesStoreMock.loading.set(true);
    expect(store.isLoading()).toBe(true);

    categoriesStoreMock.loading.set(false);
    expect(store.isLoading()).toBe(false);
  });

  it('should be throwing expenses error first when expenses store has error, even if categories store has error as well', () => {
    const store = TestBed.inject(DashboardStore);

    expensesStoreMock.error.set('Failed to load expenses');
    categoriesStoreMock.error.set('Failed to load categories');

    expect(store.error()).toBe('Failed to load expenses');
  });

  it('should be throwing categories error  when expenses store has no  error', () => {
    const store = TestBed.inject(DashboardStore);

    categoriesStoreMock.error.set('Failed to load categories');

    expect(store.error()).toBe('Failed to load categories');
  });

  it('should return null when neither store has an error', () => {
    const store = TestBed.inject(DashboardStore);

    expect(store.error()).toBeNull();
  });
});
