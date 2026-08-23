import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Category } from '../../../categories/model/category.model';
import { CategoriesStore } from '../../../categories/store/category.store';
import { CreateExpenseRequest } from '../../api/create-expense-request.model';
import { Expense } from '../../model/expense.model';
import { CreateExpenseDialogComponent } from './create-expense-dialog';
import { CreateExpenseDialogData } from '../../model/create-expense-dialog-data.model';

describe('CreateExpenseDialogComponent', () => {
  let fixture: ComponentFixture<CreateExpenseDialogComponent>;
  let component: CreateExpenseDialogComponent;

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

  const dialogRefMock = {
    close: vi.fn(),
  };

  const dialogData: CreateExpenseDialogData = {
    categories,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    expensesStoreMock.expenses.set([]);
    expensesStoreMock.expenseCount.set(0);
    expensesStoreMock.loading.set(false);
    expensesStoreMock.error.set(null);

    categoriesStoreMock.categories.set([]);
    categoriesStoreMock.loading.set(false);
    categoriesStoreMock.error.set(null);
    TestBed.configureTestingModule({
      imports: [CreateExpenseDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: CategoriesStore,
          useValue: categoriesStoreMock,
        },
      ],
    });

    fixture = TestBed.createComponent(CreateExpenseDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should display categories in expense form', () => {
    const categorySelect = fixture.debugElement.query(By.css('#expenseFormCategory'));

    categorySelect.nativeElement.click();

    fixture.detectChanges();

    const options = document.querySelectorAll('mat-option');

    expect(options.length).toBe(categories.length);

    expect(options[0].textContent).toContain('Food');
    expect(options[1].textContent).toContain('Bills');
  });

  test('should close dialog with created expense request', () => {
    const request: CreateExpenseRequest = {
      amountInMinorUnits: 4599,
      currency: 'PLN',
      description: 'Groceries',
      categoryId: 'food',
      date: '2026-08-20',
    };

    const expenseForm = fixture.debugElement.query(By.css('app-expense-form'));

    expenseForm.triggerEventHandler('createExpenseEvent', request);

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith(request);
  });

  test('should close dialog without a result when cancelled', () => {
    const cancelButton = fixture.nativeElement.querySelector('#expenseFormCancelButton');

    cancelButton.click();

    fixture.detectChanges();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });
});
