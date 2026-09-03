import { Component, effect, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

import { Category } from '../../../categories/model/category.model';
import { Budget } from '../../model/budget.model';
import { BudgetFormRequest } from '../../model/budget-form-request.model';
import { BudgetFormSubmit } from '../../model/budget-form-submit.model';

const budgetAmountValidator = (
  control: AbstractControl<number | null>,
): ValidationErrors | null => {
  const value = Number(control.value);

  if (control.value === null || !Number.isFinite(value) || value <= 0) {
    return { invalidBudget: true };
  }

  return null;
};

@Component({
  selector: 'app-budget-form',
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
  templateUrl: './budget-form.html',
  styleUrl: './budget-form.scss',
})
export class BudgetFormComponent {
  readonly initialValue = input<Budget | null>(null);
  readonly categories = input.required<Category[]>();
  readonly submissionError = input<string | null>(null);
  readonly isSubmitting = input(false);
  readonly save = output<BudgetFormSubmit>();
  protected readonly cancelAction = output<void>();

  protected readonly form = new FormGroup({
    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    month: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, budgetAmountValidator],
    }),
  });

  constructor() {
    effect(() => {
      const budget = this.initialValue();

      if (!budget) {
        return;
      }

      this.form.setValue({
        categoryId: budget.categoryId,
        month: budget.month,
        amount: budget.amountInMinorUnits / 100,
      });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const request: BudgetFormRequest = {
      categoryId: rawValue.categoryId,
      month: rawValue.month,
      amountInMinorUnits: Math.round((rawValue.amount ?? 0) * 100),
    };

    const budget = this.initialValue();

    this.save.emit({
      id: budget?.id ?? null,
      request,
    });
  }

  protected onCancel(): void {
    this.cancelAction.emit();
  }
}
