import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { CreateExpenseRequest } from '../../api/create-expense-request.model';
import { CreateExpenseDialogData } from '../../model/create-expense-dialog-data.model';
import { ExpenseFormComponent } from '../expense-form/expense-form';

@Component({
  selector: 'app-create-expense-dialog',
  imports: [MatDialogModule, ExpenseFormComponent],
  templateUrl: './create-expense-dialog.html',
})
export class CreateExpenseDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateExpenseDialogComponent>);

  protected readonly data = inject<CreateExpenseDialogData>(MAT_DIALOG_DATA);

  protected onCreateExpense(request: CreateExpenseRequest): void {
    this.dialogRef.close(request);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
