import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, test } from 'vitest';

import { Category } from '../../../categories/model/category.model';
import { ExpenseFormComponent } from './expense-form';
import { mapExpenseFormValueToCreateExpenseRequest } from '../../model/expense-form-value.model';
import { Expense } from '../../model/expense.model';

describe('ExpenseFormComponent', () => {
  let fixture: ComponentFixture<ExpenseFormComponent>;
  let component: ExpenseFormComponent;
  const expense: Expense = {
    id: '1',
    amountInMinorUnits: 4599,
    currency: 'PLN',
    description: 'Groceries',
    categoryId: 'food',
    date: '2026-08-10',
    createdAt: '2026-08-10T18:30:00Z',
    updatedAt: '2026-08-10T18:30:00Z',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExpenseFormComponent],
    });

    fixture = TestBed.createComponent(ExpenseFormComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('categories', categories);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  test('should map form value to CreateExpenseRequest', () => {
    const result = mapExpenseFormValueToCreateExpenseRequest({
      description: '  Lunch  ',
      amount: 45.99,
      currency: 'PLN',
      categoryId: 'food',
      date: '2026-08-10',
    });

    expect(result).toEqual({
      amountInMinorUnits: 4599,
      currency: 'PLN',
      description: 'Lunch',
      categoryId: 'food',
      date: '2026-08-10',
    });
  });
  test('should round amount to minor units', () => {
    const result = mapExpenseFormValueToCreateExpenseRequest({
      description: 'Coffee',
      amount: 12.345,
      currency: 'PLN',
      categoryId: 'food',
      date: '2026-08-20',
    });

    expect(result.amountInMinorUnits).toBe(1235);
  });

  test('should render expense form', () => {
    const form = fixture.debugElement.query(By.css('#expenseForm'));

    expect(form).toBeTruthy();
  });

  test('should render all expense form fields', () => {
    expect(fixture.debugElement.query(By.css('#expenseFormDescription'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#expenseFormAmount'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#expenseFormCurrency'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#expenseFormCategory'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#expenseFormDate'))).toBeTruthy();
  });

  test('should display validation errors after submitting an invalid form', () => {
    const form = fixture.debugElement.query(By.css('#expenseForm'));

    form.triggerEventHandler('ngSubmit');

    fixture.detectChanges();

    const errors = fixture.debugElement.queryAll(By.css('mat-error'));

    expect(errors.length).toBe(4);
  });

  test('should populate form with existing expense when editing', () => {
    fixture.componentRef.setInput('initialValue', expense);

    fixture.detectChanges();

    const descriptionInput = fixture.debugElement.query(
      By.css('#expenseFormDescription'),
    ).nativeElement;

    const amountInput = fixture.debugElement.query(By.css('#expenseFormAmount')).nativeElement;

    const categorySelect = fixture.debugElement.query(By.css('#expenseFormCategory')).nativeElement;

    const dateInput = fixture.debugElement.query(By.css('#expenseFormDate')).nativeElement;

    expect(descriptionInput.value).toBe('Groceries');
    expect(amountInput.value).toBe('45.99');
    expect(dateInput.value).toBe('2026-08-10');
    expect(categorySelect.textContent).toContain('Food');
  });
  test('should disable submit button while submitting', () => {
    fixture.componentRef.setInput('isSubmitting', true);

    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(
      By.css('#expenseFormSubmitButton'),
    ).nativeElement;

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Creating...');
  });

  test('should display updating state while editing and submitting', () => {
    fixture.componentRef.setInput('initialValue', expense);
    fixture.componentRef.setInput('isSubmitting', true);

    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(
      By.css('#expenseFormSubmitButton'),
    ).nativeElement;

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Updating...');
  });

  test('should display submission error', () => {
    fixture.componentRef.setInput('submissionError', 'Failed to save expense.');

    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('#expenseFormSaveError');

    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to save expense.');
  });
});
