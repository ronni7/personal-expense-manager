import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { Category } from '../../../categories/model/category.model';
import { Budget } from '../../model/budget.model';
import { BudgetFormComponent } from './budget-form';

describe('BudgetFormComponent', () => {
  let fixture: ComponentFixture<BudgetFormComponent>;

  const categories: Category[] = [
    { id: 'food', name: 'Food' },
    { id: 'housing', name: 'Housing' },
  ];

  const existingBudget: Budget = {
    id: 'budget-1',
    categoryId: 'food',
    month: '2026-08',
    amountInMinorUnits: 50000,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BudgetFormComponent],
    });

    fixture = TestBed.createComponent(BudgetFormComponent);
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  test('should render all form controls', () => {
    expect(fixture.debugElement.query(By.css('#budgetForm'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormCategory'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormMonth'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormAmount'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormCancelButton'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormSubmitButton'))).toBeTruthy();
  });

  test('should render all categories', () => {
    const categorySelect = fixture.debugElement.query(By.css('#budgetFormCategory'));

    categorySelect.nativeElement.click();

    const options = fixture.debugElement.queryAll(By.css('mat-option'));

    expect(options.length).toBe(categories.length);
    expect(options[0].nativeElement.textContent).toContain('Food');
    expect(options[1].nativeElement.textContent).toContain('Housing');
  });

  test('should invalidate the form when required fields are missing', () => {
    const formElement = fixture.debugElement.query(By.css('#budgetForm'))
      .nativeElement as HTMLFormElement;

    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#budgetFormCategoryError'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormMonthErrorRequired'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#budgetFormAmountErrorRequired'))).toBeTruthy();
  });

  test('should reject zero budget amount', () => {
    const categorySelect = fixture.debugElement.query(By.css('#budgetFormCategory')).nativeElement;

    const monthInput = fixture.debugElement.query(By.css('#budgetFormMonth'))
      .nativeElement as HTMLInputElement;

    const amountInput = fixture.debugElement.query(By.css('#budgetFormAmount'))
      .nativeElement as HTMLInputElement;

    categorySelect.click();

    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    const foodOption = options.filter((option) =>
      option.nativeElement.textContent.includes('Food'),
    )[0];
    foodOption.nativeElement.click();

    monthInput.value = '2026-08';
    monthInput.dispatchEvent(new Event('input'));

    amountInput.value = '0';
    amountInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const formElement = fixture.debugElement.query(By.css('#budgetForm'))
      .nativeElement as HTMLFormElement;

    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#budgetFormAmountErrorInvalidBudget'))).toBeTruthy();
  });

  test('should reject negative budget amount', () => {
    const amountInput = fixture.debugElement.query(By.css('#budgetFormAmount'))
      .nativeElement as HTMLInputElement;

    amountInput.value = '-10';
    amountInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const formElement = fixture.debugElement.query(By.css('#budgetForm'))
      .nativeElement as HTMLFormElement;

    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#budgetFormAmountErrorInvalidBudget'))).toBeTruthy();
  });

  test('should populate form when editing an existing budget', () => {
    fixture.componentRef.setInput('initialValue', existingBudget);
    fixture.detectChanges();

    const categorySelect = fixture.debugElement.query(By.css('#budgetFormCategory'))
      .nativeElement as HTMLSelectElement;

    const monthInput = fixture.debugElement.query(By.css('#budgetFormMonth'))
      .nativeElement as HTMLInputElement;

    const amountInput = fixture.debugElement.query(By.css('#budgetFormAmount'))
      .nativeElement as HTMLInputElement;

    expect(categorySelect.textContent).toBe('Food');
    expect(monthInput.value).toBe('2026-08');
    expect(amountInput.value).toBe('500');
  });

  test('should emit create payload when submitting a valid form in create mode', () => {
    const saveSpy = vi.fn();
    fixture.componentInstance.save.subscribe(saveSpy);

    const categorySelect = fixture.debugElement.query(By.css('#budgetFormCategory')).nativeElement;

    const monthInput = fixture.debugElement.query(By.css('#budgetFormMonth'))
      .nativeElement as HTMLInputElement;

    const amountInput = fixture.debugElement.query(By.css('#budgetFormAmount'))
      .nativeElement as HTMLInputElement;

    categorySelect.click();

    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    const foodOption = options.filter((option) =>
      option.nativeElement.textContent.includes('Food'),
    )[0];
    foodOption.nativeElement.click();

    monthInput.value = '2026-08';
    monthInput.dispatchEvent(new Event('input'));

    amountInput.value = '123.45';
    amountInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('#budgetForm'))
      .nativeElement.dispatchEvent(new Event('submit'));

    expect(saveSpy).toHaveBeenCalledWith({
      id: null,
      request: {
        categoryId: 'food',
        month: '2026-08',
        amountInMinorUnits: 12345,
      },
    });
  });

  test('should emit update payload when submitting a valid form in edit mode', () => {
    fixture.componentRef.setInput('initialValue', existingBudget);
    fixture.detectChanges();

    const saveSpy = vi.fn();
    fixture.componentInstance.save.subscribe(saveSpy);

    const amountInput = fixture.debugElement.query(By.css('#budgetFormAmount'))
      .nativeElement as HTMLInputElement;

    amountInput.value = '750.25';
    amountInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    fixture.debugElement
      .query(By.css('#budgetForm'))
      .nativeElement.dispatchEvent(new Event('submit'));

    expect(saveSpy).toHaveBeenCalledWith({
      id: 'budget-1',
      request: {
        categoryId: 'food',
        month: '2026-08',
        amountInMinorUnits: 75025,
      },
    });
  });

  test('should not emit save when form is invalid', () => {
    const saveSpy = vi.fn();
    fixture.componentInstance.save.subscribe(saveSpy);

    fixture.debugElement
      .query(By.css('#budgetForm'))
      .nativeElement.dispatchEvent(new Event('submit'));

    expect(saveSpy).not.toHaveBeenCalled();
  });

  test('should mark controls as touched when submitting an invalid form', () => {
    fixture.debugElement
      .query(By.css('#budgetForm'))
      .nativeElement.dispatchEvent(new Event('submit'));

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#budgetFormCategoryError'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#budgetFormMonthErrorRequired'))).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#budgetFormAmountErrorRequired'))).toBeTruthy();
  });

  test('should disable submit button while submitting', () => {
    fixture.componentRef.setInput('isSubmitting', true);
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('#budgetFormSubmitButton'))
      .nativeElement as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Creating...');
  });

  test('should show update state while submitting in edit mode', () => {
    fixture.componentRef.setInput('initialValue', existingBudget);
    fixture.componentRef.setInput('isSubmitting', true);
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('#budgetFormSubmitButton'))
      .nativeElement as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Updating...');
  });

  test('should render submission error', () => {
    fixture.componentRef.setInput('submissionError', 'Failed to save budget.');
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('#budgetFormSaveError'));

    expect(error).toBeTruthy();
    expect(error.nativeElement.textContent).toContain('Failed to save budget.');
  });
});
