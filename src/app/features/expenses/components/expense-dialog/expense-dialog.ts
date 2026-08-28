import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ExpenseDialogData } from '../../model/expense-dialog-data.model';
import { ExpenseFormSubmit } from '../../model/expense-form-submit.model';
import { ExpensesStore } from '../../store/expense.store';
import { ExpenseFormComponent } from '../expense-form/expense-form';

@Component({
  selector: 'app-create-expense-dialog',
  imports: [MatDialogModule, ExpenseFormComponent],
  templateUrl: './expense-dialog.html',
})
export class ExpenseDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ExpenseDialogComponent>);

  protected readonly expensesStore = inject(ExpensesStore);

  protected readonly data = inject<ExpenseDialogData>(MAT_DIALOG_DATA);

  protected onSave(result: ExpenseFormSubmit): void {
    this.dialogRef.close(result);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
