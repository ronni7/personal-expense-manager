import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Category } from '../../../categories/model/category.model';
import { CreateExpenseRequest } from '../../api/create-expense-request.model';
import { mapExpenseFormValueToCreateExpenseRequest } from '../../model/expense-form-value.model';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

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
  readonly categories = input.required<Category[]>();
  readonly isSubmitting = input(false);
  protected readonly createExpenseEvent = output<CreateExpenseRequest>();
  protected readonly createExpenseCancel = output<void>();

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

    this.createExpenseEvent.emit(
      mapExpenseFormValueToCreateExpenseRequest(this.form.getRawValue()),
    );
  }

  protected onCancel(): void {
    this.createExpenseCancel.emit();
  }
}
