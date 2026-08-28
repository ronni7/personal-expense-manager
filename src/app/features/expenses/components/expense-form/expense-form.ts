import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Category } from '../../../categories/model/category.model';
import { mapExpenseFormValueToCreateExpenseRequest } from '../../model/expense-form-value.model';
import { Expense } from '../../model/expense.model';
import { ExpenseFormSubmit } from '../../model/expense-form-submit.model';

@Component({
  selector: 'app-expense-form',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
  ],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseFormComponent {
  constructor() {
    effect(() => {
      const expense = this.initialValue();

      if (!expense) {
        return;
      }

      this.form.setValue({
        description: expense.description,
        amount: expense.amountInMinorUnits / 100,
        currency: expense.currency,
        categoryId: expense.categoryId,
        date: expense.date,
      });
    });
  }
  readonly initialValue = input<Expense | null>(null);
  readonly categories = input.required<Category[]>();
  readonly submissionError = input<string | null>(null);
  readonly isSubmitting = input(false);
  readonly save = output<ExpenseFormSubmit>();
  protected readonly cancelAction = output<void>();

  protected readonly form = new FormGroup({
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),

    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),

    currency: new FormControl<'PLN' | 'USD' | 'EUR'>('PLN', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request = mapExpenseFormValueToCreateExpenseRequest(value);

    const expense = this.initialValue();

    if (expense) {
      // edit existing expense
      this.save.emit({
        id: expense.id,
        request,
      });

      return;
    }

    // add new expense
    this.save.emit({
      id: null,
      request,
    });
  }

  protected onCancel(): void {
    this.cancelAction.emit();
  }
}
