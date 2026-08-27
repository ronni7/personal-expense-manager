import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Category } from '../../../categories/model/category.model';
import { CreateExpenseRequest } from '../../api/create-expense-request.model';
import { CreateExpenseDialogData } from '../../model/create-expense-dialog-data.model';
import { Expense } from '../../model/expense.model';
import { ExpensesStore } from '../../store/expense.store';
import { CreateExpenseDialogComponent } from './create-expense-dialog';

describe('CreateExpenseDialogComponent', () => {
  let fixture: ComponentFixture<CreateExpenseDialogComponent>;
  let component: CreateExpenseDialogComponent;

  const expensesStoreMock = {
    expenses: signal<Expense[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    expenseCount: signal(0),
    creating: signal(false),
    createError: signal<string | null>(null),
    addExpense: vi.fn(),
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
    expensesStoreMock.creating.set(false);
    expensesStoreMock.createError.set(null);

    expensesStoreMock.addExpense.mockImplementation(() => {
      expensesStoreMock.creating.set(true);
    });
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
          provide: ExpensesStore,
          useValue: expensesStoreMock,
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

  test('should add expense when form emits create request', () => {
    const request: CreateExpenseRequest = {
      amountInMinorUnits: 4599,
      currency: 'PLN',
      description: 'Groceries',
      categoryId: 'food',
      date: '2026-08-20',
    };

    const expenseForm = fixture.debugElement.query(By.css('app-expense-form'));

    expenseForm.triggerEventHandler('createExpenseEvent', request);

    expect(expensesStoreMock.addExpense).toHaveBeenCalledTimes(1);
    expect(expensesStoreMock.addExpense).toHaveBeenCalledWith(request);
  });

  test('should close dialog without a result when cancelled', () => {
    const cancelButton = fixture.nativeElement.querySelector('#expenseFormCancelButton');

    cancelButton.click();

    fixture.detectChanges();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });

  test('should disable form submission while expense is being created', () => {
    expensesStoreMock.creating.set(true);

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('#expenseFormSubmitButton');

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Creating...');
  });

  test('should display submission error', () => {
    expensesStoreMock.createError.set('Failed to create expense.');

    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('#expenseFormCreateError');

    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to create expense.');
  });

  test('should close dialog after successful expense creation', () => {
    expensesStoreMock.addExpense.mockImplementation(() => {
      expensesStoreMock.creating.set(true);
    });

    const request: CreateExpenseRequest = {
      amountInMinorUnits: 4599,
      currency: 'PLN',
      description: 'Groceries',
      categoryId: 'food',
      date: '2026-08-20',
    };

    const expenseForm = fixture.debugElement.query(By.css('app-expense-form'));

    expenseForm.triggerEventHandler('createExpenseEvent', request);

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    expensesStoreMock.creating.set(false);
    expensesStoreMock.createError.set(null);

    fixture.detectChanges();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });

  test('should keep dialog open when expense creation fails', () => {
    const request: CreateExpenseRequest = {
      amountInMinorUnits: 4599,
      currency: 'PLN',
      description: 'Groceries',
      categoryId: 'food',
      date: '2026-08-20',
    };

    const expenseForm = fixture.debugElement.query(By.css('app-expense-form'));

    expenseForm.triggerEventHandler('createExpenseEvent', request);

    expect(expensesStoreMock.creating()).toBe(true);

    expensesStoreMock.creating.set(false);
    expensesStoreMock.createError.set('Failed to create expense.');

    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const error = fixture.nativeElement.querySelector('#expenseFormCreateError');

    expect(error).toBeTruthy();
  });
});
