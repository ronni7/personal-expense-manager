import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpensesPageStore } from './expenses-page-store';
import { test, vi } from 'vitest';
import { ExpensesStore } from '../../store/expense.store';
import { Expense } from '../../model/expense.model';
import { signal } from '@angular/core';
import { ExpensesPage } from '../expenses-page/expenses-page';
import { By } from '@angular/platform-browser';
import { Category } from '../../../categories/model/category.model';
import { CategoriesStore } from '../../../categories/store/category.store';

const categoriesStoreMock = {
  categories: signal<Category[]>([]),
  loading: signal<boolean>(false),
  error: signal<string | null>(null),
  loadCategories: vi.fn(),
};
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
describe('ExpensesPageStore', () => {
  beforeEach(() => {
    expensesStoreMock.expenses.set([]);
    expensesStoreMock.loadExpenses.mockReset();
    expensesStoreMock.loading.set(false);
    expensesStoreMock.error.set(null);
    categoriesStoreMock.categories.set([]);
    categoriesStoreMock.loading.set(false);
    categoriesStoreMock.error.set(null);
    categoriesStoreMock.loadCategories.mockReset();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ExpensesPageStore,
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
  test('should combine expenses with their categories', () => {
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

    expensesStoreMock.expenses.set(expenses);
    categoriesStoreMock.categories.set(categories);

    const store = TestBed.inject(ExpensesPageStore);

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
  test('should set category to null when expense category does not exist', () => {
    const expense: Expense = {
      id: '1',
      categoryId: 'unknown',
      description: 'Something',
      amountInMinorUnits: 1_000,
      date: '2026-08-10',
      currency: 'PLN',
      createdAt: '2026-08-10T18:30:00Z',
      updatedAt: '2026-08-10T18:30:00Z',
    };

    expensesStoreMock.expenses.set([expense]);
    categoriesStoreMock.categories.set([]);

    const store = TestBed.inject(ExpensesPageStore);

    expect(store.expensesWithCategory()).toEqual([
      {
        ...expense,
        category: null,
      },
    ]);
  });
  test('should update expense category when categories change', () => {
    const expense: Expense = {
      id: '1',
      categoryId: 'food',
      description: 'Groceries',
      amountInMinorUnits: 4_500,
      date: '2026-08-10',
      currency: 'PLN',
      createdAt: '2026-08-10T18:30:00Z',
      updatedAt: '2026-08-10T18:30:00Z',
    };

    expensesStoreMock.expenses.set([expense]);

    const store = TestBed.inject(ExpensesPageStore);

    expect(store.expensesWithCategory()).toEqual([
      {
        ...expense,
        category: null,
      },
    ]);

    categoriesStoreMock.categories.set([
      {
        id: 'food',
        name: 'Food',
      },
    ]);

    expect(store.expensesWithCategory()).toEqual([
      {
        ...expense,
        category: {
          id: 'food',
          name: 'Food',
        },
      },
    ]);
  });
});

////////////////////// UI ZONE ////////////////////////////
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
    categoriesStoreMock.categories.set([]);
    categoriesStoreMock.loading.set(false);
    categoriesStoreMock.error.set(null);
    categoriesStoreMock.loadCategories.mockReset();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ExpensesPageStore,
        { provide: ExpensesStore, useValue: expensesStoreMock },
        { provide: CategoriesStore, useValue: categoriesStoreMock },
      ],
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
    const expenses: Expense[] = [
      {
        id: '1',
        categoryId: 'food',
        description: 'Groceries',
        amountInMinorUnits: 4500,
        date: '2026-08-10',
        currency: 'PLN',
        createdAt: '2026-08-10T18:30:00Z',
        updatedAt: '2026-08-10T18:30:00Z',
      },
    ];

    expensesStoreMock.expenses.set(expenses);
    expensesStoreMock.expenseCount.set(expenses.length);
    fixture.detectChanges();
    const pageStore = fixture.componentRef.injector.get(ExpensesPageStore);

    expensesStoreMock.expenses.set(expenses);

    expect(pageStore.expenses().length).toBe(1);
    expect(pageStore.expenseCount()).toBe(1);
  });

  //// Mat table related /////
  test('should display all configured expense table columns', () => {
    expensesStoreMock.expenses.set([expenses[0]]);
    expensesStoreMock.expenseCount.set(1);

    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('tr[mat-header-row] th'));

    expect(headers.length).toBe(4);

    const headerTexts = headers.map((header) => header.nativeElement.textContent.trim());

    expect(headerTexts).toEqual(['Date', 'Description', 'Category', 'Amount']);
  });
  test('should display one table row for each expense', () => {
    expensesStoreMock.expenses.set(expenses);
    expensesStoreMock.expenseCount.set(expenses.length);

    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));

    expect(rows.length).toBe(expenses.length);
  });
  test('should display expense data in table row', () => {
    expensesStoreMock.expenses.set([expenses[0]]);
    expensesStoreMock.expenseCount.set(1);

    categoriesStoreMock.categories.set([
      {
        id: 'food',
        name: 'Food',
      },
    ]);

    fixture.detectChanges();

    const row = fixture.debugElement.query(By.css('tr[mat-row]'));

    expect(row).toBeTruthy();

    const cells = row.queryAll(By.css('td'));

    expect(cells[0].nativeElement.textContent).toContain('2026-08-10');
    expect(cells[1].nativeElement.textContent).toContain('Groceries');
    expect(cells[2].nativeElement.textContent).toContain('Food');
    expect(cells[3].nativeElement.textContent).toContain('45.00');
  });

  test('should not display table when there are no expenses', () => {
    expensesStoreMock.expenses.set([]);
    expensesStoreMock.expenseCount.set(0);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('table[mat-table]'))).toBeNull();

    expect(fixture.debugElement.query(By.css('#expensesPageNoExpensesText'))).toBeTruthy();
  });

  test('should combine expenses with their categories', () => {
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

    expensesStoreMock.expenses.set(expenses);
    categoriesStoreMock.categories.set(categories);

    const store = TestBed.inject(ExpensesPageStore);

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
  test('should display expenses in the order provided by the store', () => {
    expensesStoreMock.expenses.set(expenses);
    expensesStoreMock.expenseCount.set(expenses.length);

    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));

    expect(rows.length).toBe(expenses.length);

    expect(rows[0].nativeElement.textContent).toContain('2026-08-10');
    expect(rows[1].nativeElement.textContent).toContain('2026-08-09');
  });
});
