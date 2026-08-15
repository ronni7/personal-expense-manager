import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { By } from '@angular/platform-browser';

import { DashboardPage } from './dashboard-page';
import { ExpensesStore } from '../../../expenses/store/expense.store';
import { CategoriesStore } from '../../../categories/store/category.store';
import { Category } from '../../../categories/model/category.model';
import { Expense } from '../../../expenses/model/expense.model';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let component: DashboardPage;

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

  const categoriesStoreMock = {
    categories: signal<Category[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    loadCategories: vi.fn(),
  };

  beforeEach(async () => {
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

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should display loading state while dashboard data is loading', () => {
    expensesStoreMock.loading.set(true);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading...');
    expect(fixture.nativeElement.textContent).not.toContain('Financial summary');
  });

  test('should display dashboard content when data is loaded', () => {
    expensesStoreMock.loading.set(false);
    fixture.detectChanges();

    const dashboardPageTitleEl = fixture.debugElement.query(By.css('#dashboardPageTitle'));
    const dashboardPageSummarySectionEl = fixture.debugElement.query(
      By.css('#dashboardPageSummarySection'),
    );
    const dashboardPageBudgetTitleEl = fixture.debugElement.query(
      By.css('#dashboardPageBudgetTitle'),
    );
    const dashboardPageRecentExpensesTitleEl = fixture.debugElement.query(
      By.css('#dashboardPageRecentExpensesTitle'),
    );

    expect(dashboardPageTitleEl.nativeElement.textContent).toContain('Dashboard');
    expect(dashboardPageSummarySectionEl.nativeElement.textContent).toContain('Balance');
    expect(dashboardPageBudgetTitleEl.nativeElement.textContent).toContain('Budget');
    expect(dashboardPageRecentExpensesTitleEl.nativeElement.textContent).toContain(
      'Recent expenses',
    );
  });

  test('should display financial summary values', () => {
    expensesStoreMock.loading.set(false);
    expensesStoreMock.balance.set(38_000);
    expensesStoreMock.incomeTotal.set(50_000);
    expensesStoreMock.expenseTotal.set(12_000);
    expensesStoreMock.totalExpensesAmountInMinorUnits.set(12_000);
    expensesStoreMock.expenseCount.set(3);

    fixture.detectChanges();

    const balanceEl = fixture.debugElement.query(By.css('#dashboardPageBalanceAmount'));
    const incomeEl = fixture.debugElement.query(By.css('#dashboardPageIncomeTotalAmount'));
    const expenseEl = fixture.debugElement.query(By.css('#dashboardPageExpenseTotalAmount'));
    const countEl = fixture.debugElement.query(By.css('#dashboardPageExpenseCount'));

    expect(balanceEl.nativeElement.textContent).toContain('380.00');
    expect(incomeEl.nativeElement.textContent).toContain('500.00');
    expect(expenseEl.nativeElement.textContent).toContain('120.00');
    expect(countEl.nativeElement.textContent).toContain('3 expenses');
  });

  test('should display recent expenses when available', () => {
    expensesStoreMock.expenses.set([
      {
        id: '1',
        description: 'Groceries',
        amountInMinorUnits: 4599,
        currency: 'PLN',
        categoryId: 'food',
        date: '2026-08-12',
        createdAt: '2026-08-12T18:30:00Z',
        updatedAt: '2026-08-10T18:30:00Z',
      },
    ]);

    categoriesStoreMock.categories.set([
      {
        id: 'food',
        name: 'Food',
      },
    ]);
    expensesStoreMock.loading.set(false);
    fixture.detectChanges();

    const descEl = fixture.debugElement.query(By.css('#dashboardPageExpenseDescription-1'));
    const catEl = fixture.debugElement.query(By.css('#dashboardPageExpenseCategory-1'));
    const amountEl = fixture.debugElement.query(By.css('#dashboardPageExpenseAmount-1'));

    expect(descEl.nativeElement.textContent).toContain('Groceries');
    expect(catEl.nativeElement.textContent).toContain('Food');
    expect(amountEl.nativeElement.textContent).toContain('45.99');
  });

  test('should display empty state when there are no recent expenses', () => {
    expensesStoreMock.expenses.set([]);
    categoriesStoreMock.categories.set([]);
    expensesStoreMock.loading.set(false);
    fixture.detectChanges();

    const noExpensesEl = fixture.debugElement.query(By.css('#dashboardPageNoExpensesText'));
    expect(noExpensesEl.nativeElement.textContent).toContain('No expenses yet.');
  });

  test('should display error when expenses loading fails', () => {
    expensesStoreMock.error.set('Failed to load expenses');
    expensesStoreMock.loading.set(false);

    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('#dashboardPageErrorText'));

    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Failed to load expenses');
  });
  test('should display error when expenses loading fails', () => {
    expensesStoreMock.error.set('Failed to load expenses');
    expensesStoreMock.loading.set(false);

    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('#dashboardPageErrorText'));

    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Failed to load expenses');
  });
  test('should display error when categories loading fails', () => {
    categoriesStoreMock.error.set('Failed to load categories');
    categoriesStoreMock.loading.set(false);

    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('#dashboardPageErrorText'));

    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Failed to load categories');
  });
  test('should not display dashboard content when an error occurs', () => {
    expensesStoreMock.error.set('Failed to load expenses');
    expensesStoreMock.loading.set(false);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#dashboardPageSummarySection'))).toBeNull();

    expect(fixture.debugElement.query(By.css('#dashboardPageErrorText'))).toBeTruthy();
  });

  test('should display loading state instead of error while loading', () => {
    expensesStoreMock.loading.set(true);
    expensesStoreMock.error.set('Failed to load expenses');

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#dashboardPageLoadingText'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#dashboardPageErrorText'))).toBeNull();
  });
});
