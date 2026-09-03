import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, test, vi } from 'vitest';

import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Category } from '../../../categories/model/category.model';
import { BudgetDialogComponent } from '../../components/budget-dialog/budget-dialog';
import { Budget } from '../../model/budget.model';
import { BudgetWithCategory } from '../../model/budget-with-category.model';
import { BudgetsPageStore } from '../store/budgets-page-store';
import { BudgetsPage } from './budgets-page';
import { BudgetFormSubmit } from '../../model/budget-form-submit.model';

describe('BudgetsPage', () => {
  let fixture: ComponentFixture<BudgetsPage>;

  const pageStoreMock = {
    selectedMonth: signal('2026-08'),
    categories: signal<Category[]>([]),
    isLoading: signal(false),
    error: signal<string | null>(null),
    totalBudget: signal(0),
    totalSpent: signal(0),
    remainingTotal: signal(0),
    percentUsed: signal(0),
    isEmpty: signal(true),
    categoryBudgetRows: signal<BudgetWithCategory[]>([]),

    setSelectedMonth: vi.fn(),
    addBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
  };

  const dialogRefMock = {
    afterClosed: vi.fn(),
  };

  const dialogMock = {
    open: vi.fn(),
  };
  const budget: Budget = {
    id: 'budget-1',
    categoryId: 'food',
    month: '2026-08',
    amountInMinorUnits: 50000,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  };
  pageStoreMock.categoryBudgetRows.set([
    {
      category: { id: 'food', name: 'Food' },
      budget,
      spent: 20000,
      remaining: 30000,
      progress: 40,
      overBudget: false,
    },
  ]);
  beforeEach(() => {
    vi.clearAllMocks();

    pageStoreMock.selectedMonth.set('2026-08');
    pageStoreMock.categories.set([]);
    pageStoreMock.isLoading.set(false);
    pageStoreMock.error.set(null);
    pageStoreMock.totalBudget.set(0);
    pageStoreMock.totalSpent.set(0);
    pageStoreMock.remainingTotal.set(0);
    pageStoreMock.percentUsed.set(0);
    pageStoreMock.isEmpty.set(true);
    pageStoreMock.categoryBudgetRows.set([]);

    dialogRefMock.afterClosed.mockReturnValue(of(undefined));
    dialogMock.open.mockReturnValue(dialogRefMock);

    TestBed.configureTestingModule({
      imports: [BudgetsPage],
      providers: [
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
      ],
    });

    TestBed.overrideComponent(BudgetsPage, {
      add: {
        providers: [
          {
            provide: MatDialog,
            useValue: dialogMock,
          },
          {
            provide: BudgetsPageStore,
            useValue: pageStoreMock,
          },
        ],
      },
    });

    fixture = TestBed.createComponent(BudgetsPage);
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  test('should open create budget dialog', () => {
    const categories: Category[] = [
      { id: 'food', name: 'Food' },
      { id: 'bills', name: 'Bills' },
    ];

    pageStoreMock.categories.set(categories);

    const createButton = fixture.debugElement.query(By.css('#budgetsPageCreateBudgetButton'));

    createButton.nativeElement.click();

    expect(dialogMock.open).toHaveBeenCalled();
  });
  test('should display empty state when no budgets exist', () => {
    const emptyState = fixture.debugElement.query(By.css('#budgetsPageEmptyState'));

    expect(emptyState).toBeTruthy();
    expect(emptyState.nativeElement.textContent).toContain('No monthly budgets yet');
  });

  test('should display loading state', () => {
    pageStoreMock.isLoading.set(true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#budgetsPageLoadingText'))).toBeTruthy();
  });

  test('should display error state', () => {
    pageStoreMock.error.set('Failed to load budgets.');
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('#budgetsPageErrorText'));

    expect(error).toBeTruthy();
    expect(error.nativeElement.textContent).toContain('Failed to load budgets.');
  });

  test('should render overview values', () => {
    pageStoreMock.isEmpty.set(false);
    pageStoreMock.totalBudget.set(30000);
    pageStoreMock.totalSpent.set(12000);
    pageStoreMock.remainingTotal.set(18000);
    pageStoreMock.percentUsed.set(40);

    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('#budgetsPageBudgetTotal')).nativeElement.textContent,
    ).toContain('300.00');

    expect(
      fixture.debugElement.query(By.css('#budgetsPageSpentTotal')).nativeElement.textContent,
    ).toContain('120.00');

    expect(
      fixture.debugElement.query(By.css('#budgetsPageRemainingTotal')).nativeElement.textContent,
    ).toContain('180.00');

    expect(
      fixture.debugElement.query(By.css('#budgetsPageProgressText')).nativeElement.textContent,
    ).toContain('40');
  });

  test('should change selected month', () => {
    const input = fixture.debugElement.query(By.css('#budgetsPageMonthFilter'))
      .nativeElement as HTMLInputElement;

    input.value = '2026-09';
    input.dispatchEvent(new Event('input'));

    expect(pageStoreMock.setSelectedMonth).toHaveBeenCalledWith('2026-09');
  });
  test('should open create budget dialog', () => {
    const categories: Category[] = [
      { id: 'food', name: 'Food' },
      { id: 'bills', name: 'Bills' },
    ];

    pageStoreMock.categories.set(categories);

    const createButton = fixture.debugElement.query(By.css('#budgetsPageCreateBudgetButton'));
    createButton.nativeElement.click();

    expect(dialogMock.open).toHaveBeenCalledWith(BudgetDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        categories,
        budget: null,
      },
    });
  });

  test('should open edit dialog with selected budget', () => {
    const budget = {
      id: 'budget-1',
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 50000,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    };
    const row: BudgetWithCategory = {
      category: {
        id: 'food',
        name: 'Food',
      },
      budget,
      spent: 20000,
      remaining: 30000,
      progress: 40,
      overBudget: false,
    };
    pageStoreMock.isEmpty.set(false);
    pageStoreMock.categoryBudgetRows.set([row]);

    fixture.detectChanges();

    const editButton = fixture.debugElement.query(By.css('[aria-label="Edit budget"]'));

    expect(editButton).not.toBeNull();

    editButton.nativeElement.click();

    expect(dialogMock.open).toHaveBeenCalledWith(BudgetDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        categories: [],
        budget,
      },
    });
  });

  test('should delete selected budget', () => {
    const budget: Budget = {
      id: 'budget-1',
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 50000,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    };
    const row: BudgetWithCategory = {
      category: {
        id: 'food',
        name: 'Food',
      },
      budget,
      spent: 20000,
      remaining: 30000,
      progress: 40,
      overBudget: false,
    };

    pageStoreMock.isEmpty.set(false);
    pageStoreMock.categoryBudgetRows.set([row]);

    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('[aria-label="Delete budget"]'));

    expect(deleteButton).not.toBeNull();

    deleteButton.nativeElement.click();

    expect(pageStoreMock.deleteBudget).toHaveBeenCalledWith('budget-1');
  });
  test('should add budget when dialog closes with create result', () => {
    const result: BudgetFormSubmit = {
      id: null,
      request: {
        categoryId: 'food',
        month: '2026-08',
        amountInMinorUnits: 50000,
      },
    };

    dialogRefMock.afterClosed.mockReturnValue(of(result));

    fixture.debugElement.query(By.css('#budgetsPageCreateBudgetButton')).nativeElement.click();

    expect(pageStoreMock.addBudget).toHaveBeenCalledWith(result.request);
    expect(pageStoreMock.updateBudget).not.toHaveBeenCalled();
  });

  test('should update budget when dialog closes with edit result', () => {
    const result: BudgetFormSubmit = {
      id: 'budget-1',
      request: {
        categoryId: 'food',
        month: '2026-08',
        amountInMinorUnits: 75000,
      },
    };

    dialogRefMock.afterClosed.mockReturnValue(of(result));

    const budget: Budget = {
      id: 'budget-1',
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 50000,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    };

    pageStoreMock.isEmpty.set(false);
    pageStoreMock.categoryBudgetRows.set([
      {
        category: { id: 'food', name: 'Food' },
        budget,
        spent: 20000,
        remaining: 30000,
        progress: 40,
        overBudget: false,
      },
    ]);

    fixture.detectChanges();

    const editButton = fixture.debugElement.query(By.css('[aria-label="Edit budget"]'));

    expect(editButton).not.toBeNull();

    editButton.nativeElement.click();

    expect(pageStoreMock.updateBudget).toHaveBeenCalledWith('budget-1', result.request);

    expect(pageStoreMock.addBudget).not.toHaveBeenCalled();
  });
  test('should not perform any action when dialog is cancelled', () => {
    dialogRefMock.afterClosed.mockReturnValue(of(undefined));

    fixture.debugElement.query(By.css('#budgetsPageCreateBudgetButton')).nativeElement.click();

    expect(pageStoreMock.addBudget).not.toHaveBeenCalled();
    expect(pageStoreMock.updateBudget).not.toHaveBeenCalled();
  });
  test('should show add action when category has no budget', () => {
    pageStoreMock.isEmpty.set(false);
    pageStoreMock.categoryBudgetRows.set([
      {
        category: { id: 'food', name: 'Food' },
        budget: null,
        spent: 10000,
        remaining: -10000,
        progress: 0,
        overBudget: false,
      },
    ]);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[aria-label="Add budget"]'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('[aria-label="Edit budget"]'))).toBeNull();

    expect(fixture.debugElement.query(By.css('[aria-label="Delete budget"]'))).toBeNull();
  });
});
