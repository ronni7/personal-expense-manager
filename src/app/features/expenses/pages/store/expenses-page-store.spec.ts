import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpensesPageStore } from './expenses-page-store';
import { test, vi } from 'vitest';
import { ExpensesStore } from '../../store/expense.store';
import { Expense } from '../../model/expense.model';
import { signal } from '@angular/core';
import { ExpensesPage } from '../expenses-page/expenses-page';
import { By } from '@angular/platform-browser';

const expensesStoreMock = {
  expenses: signal<Expense[]>([]),
  loading: signal<boolean>(false),
  error: signal<string | null>(null),
  expenseTotal: signal(0),
  incomeTotal: signal(0),
  expenseCount: signal(0),
  balance: signal(0),
  totalExpensesAmountInMinorUnits: signal(0),
  loadExpenses: vi.fn(),
};

describe('ExpensesPageStore', () => {
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

  beforeEach(() => {
    expensesStoreMock.expenses.set([]);
    expensesStoreMock.loadExpenses.mockReset();
    expensesStoreMock.loading.set(false);
    expensesStoreMock.error.set(null);
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ExpensesPageStore,
        {
          provide: ExpensesStore,
          useValue: expensesStoreMock,
        },
      ],
    });
  });

  test('should load expenses on initialization', () => {
    TestBed.inject(ExpensesPageStore);

    expect(expensesStoreMock.loadExpenses).toHaveBeenCalled();
  });

  test('should expose expenses from ExpensesStore', () => {
    expensesStoreMock.expenses.set(expenses);

    const store = TestBed.inject(ExpensesPageStore);

    expect(store.expenses()).toEqual(expenses);
  });
  test('should react to changes in ExpensesStore expenses', () => {
    const store = TestBed.inject(ExpensesPageStore);

    expect(store.expenses()).toEqual([]);

    expensesStoreMock.expenses.set(expenses);

    expect(store.expenses()).toEqual(expenses);
  });
  test('should expose loading state from ExpensesStore', () => {
    const store = TestBed.inject(ExpensesPageStore);

    expect(store.isLoading()).toBe(false);

    expensesStoreMock.loading.set(true);

    expect(store.isLoading()).toBe(true);
  });
  test('should expose error from ExpensesStore', () => {
    const store = TestBed.inject(ExpensesPageStore);

    expect(store.error()).toBeNull();

    expensesStoreMock.error.set('Failed to load expenses.');

    expect(store.error()).toBe('Failed to load expenses.');
  });
});

describe('ExpensesPageUI', () => {
  let fixture: ComponentFixture<ExpensesPage>;

  // [MA] in fact, it is used, just not as openly as ESLint wants
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: ExpensesPage;

  beforeEach(() => {
    expensesStoreMock.expenses.set([]);
    expensesStoreMock.loadExpenses.mockReset();
    expensesStoreMock.loading.set(false);
    expensesStoreMock.error.set(null);
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [ExpensesPageStore, { provide: ExpensesStore, useValue: expensesStoreMock }],
    });
    fixture = TestBed.createComponent(ExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should display loading state while expenses are loading', () => {
    expensesStoreMock.loading.set(true);

    fixture.detectChanges();

    const loadingEl = fixture.debugElement.query(By.css('#expensesPageLoadingText'));

    expect(loadingEl).toBeTruthy();
    expect(loadingEl.nativeElement.textContent).toContain('Loading...');

    expect(fixture.debugElement.query(By.css('#expensesPageContainer'))).toBeNull();
  });
  test('should display error state when loading expenses fails', () => {
    expensesStoreMock.error.set('Failed to load expenses.');

    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('#expensesPageErrorText'));

    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Failed to load expenses.');

    expect(fixture.debugElement.query(By.css('#expensesPageContainer'))).toBeNull();
  });
  test('should display empty state when there are no expenses', () => {
    fixture.detectChanges();

    const noExpensesEl = fixture.debugElement.query(By.css('#expensesPageNoExpensesText'));

    expect(noExpensesEl).toBeTruthy();
    expect(noExpensesEl.nativeElement.textContent).toContain('No expenses yet.');
  });
  test('should display expenses when expenses are available', () => {
    expensesStoreMock.expenses.set([
      {
        id: '1',
        description: 'Groceries',
        amountInMinorUnits: 4599,
        currency: 'PLN',
        categoryId: 'food',
        date: '2026-08-12',
        createdAt: '2026-08-12T18:30:00Z',
        updatedAt: '2026-08-12T18:30:00Z',
      },
    ]);

    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('#expensesPageContainer'));

    expect(container).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#expensesPageNoExpensesText'))).toBeNull();

    expect(
      fixture.debugElement.query(By.css('#expensesPageExpenseCount')).nativeElement.textContent,
    ).toContain('1 expenses');
  });
});
