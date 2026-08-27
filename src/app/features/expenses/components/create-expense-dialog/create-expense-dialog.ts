import { Component, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { CreateExpenseRequest } from '../../api/create-expense-request.model';
import { CreateExpenseDialogData } from '../../model/create-expense-dialog-data.model';
import { ExpenseFormComponent } from '../expense-form/expense-form';
import { ExpensesStore } from '../../store/expense.store';

@Component({
  selector: 'app-create-expense-dialog',
  imports: [MatDialogModule, ExpenseFormComponent],
  templateUrl: './create-expense-dialog.html',
})
export class CreateExpenseDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateExpenseDialogComponent>);

  protected readonly expensesStore = inject(ExpensesStore);

  protected readonly data = inject<CreateExpenseDialogData>(MAT_DIALOG_DATA);

  private readonly submitted = signal(false);

  constructor() {
    effect(() => {
      if (this.submitted() && !this.expensesStore.creating() && !this.expensesStore.createError()) {
        this.dialogRef.close();
      }
    });
  }

  protected onCreateExpense(request: CreateExpenseRequest): void {
    this.submitted.set(true);
    this.expensesStore.addExpense(request);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
