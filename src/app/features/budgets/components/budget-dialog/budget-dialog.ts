import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { BudgetDialogData } from '../../model/budget-dialog-data.model';
import { BudgetFormSubmit } from '../../model/budget-form-submit.model';
import { BudgetFormComponent } from '../budget-form/budget-form';

@Component({
  selector: 'app-budget-dialog',
  imports: [MatDialogModule, BudgetFormComponent],
  templateUrl: './budget-dialog.html',
})
export class BudgetDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<BudgetDialogComponent>);

  protected readonly data = inject<BudgetDialogData>(MAT_DIALOG_DATA);

  protected onSave(result: BudgetFormSubmit): void {
    this.dialogRef.close(result);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
