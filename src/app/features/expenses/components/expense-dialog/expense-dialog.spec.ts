import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Category } from '../../../categories/model/category.model';
import { ExpenseDialogData } from '../../model/expense-dialog-data.model';
import { Expense } from '../../model/expense.model';
import { ExpensesStore } from '../../store/expense.store';
import { ExpenseDialogComponent } from './expense-dialog';

describe('ExpenseDialogComponent', () => {
  let fixture: ComponentFixture<ExpenseDialogComponent>;
  let component: ExpenseDialogComponent;

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

  const dialogData: ExpenseDialogData = {
    expense: {
      id: '1',
      categoryId: 'food',
      description: 'Groceries',
      amountInMinorUnits: 4500,
      date: '2026-08-10',
      currency: 'PLN',
      createdAt: '2026-08-10T18:30:00Z',
      updatedAt: '2026-08-10T18:30:00Z',
    },
    categories: categories,
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
      imports: [ExpenseDialogComponent],
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

    fixture = TestBed.createComponent(ExpenseDialogComponent);
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

  test('should close dialog with form result when saved', () => {
    const result = {
      id: null,
      request: {
        amountInMinorUnits: 4599,
        currency: 'PLN',
        description: 'Groceries',
        categoryId: 'food',
        date: '2026-08-20',
      },
    };

    const expenseForm = fixture.debugElement.query(By.css('app-expense-form'));

    expenseForm.triggerEventHandler('save', result);

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith(result);
  });

  test('should close dialog without a result when cancelled', () => {
    const cancelButton = fixture.nativeElement.querySelector('#expenseFormCancelButton');

    cancelButton.click();

    fixture.detectChanges();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });
});
