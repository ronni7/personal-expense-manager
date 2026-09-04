import { CurrencyPipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';

import { ExpenseDialogData } from '../../model/expense-dialog-data.model';
import { ExpenseFormSubmit } from '../../model/expense-form-submit.model';
import { Expense } from '../../model/expense.model';
import { ExpensesPageStore } from '../store/expenses-page-store';
import { EXPENSE_TABLE_COLUMNS, ExpenseTableColumn } from './expense-table-columns';

@Component({
  selector: 'app-expenses-page',
  imports: [
    CurrencyPipe,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatDialogModule,
    MatIconModule,
  ],
  providers: [],
  templateUrl: './expenses-page.html',
  styleUrl: './expenses-page.scss',
})
export class ExpensesPage {
  protected readonly expensesPageStore = inject(ExpensesPageStore);
  protected readonly displayedColumns: readonly ExpenseTableColumn[] = EXPENSE_TABLE_COLUMNS;
  private readonly dialog = inject(MatDialog);
  private readonly data = inject<ExpenseDialogData | undefined>(MAT_DIALOG_DATA, {
    optional: true,
  });
  readonly cancelAction = output<void>();

  protected readonly categories = this.data?.categories ?? [];

  protected onSortChange(sort: Sort): void {
    this.expensesPageStore.setSort(sort);
  }

  protected onSearchQueryChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.expensesPageStore.setSearchQuery(input.value);
  }

  protected async openExpenseDialog(expense?: Expense): Promise<void> {
    const { ExpenseDialogComponent: ExpenseDialogComponent } =
      await import('../../components/expense-dialog/expense-dialog');

    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      height: 'min(800px, 95vh)',
      panelClass: 'expense-create-dialog',
      data: {
        categories: this.expensesPageStore.categories(),
        expense,
      },
    });

    dialogRef.afterClosed().subscribe((result?: ExpenseFormSubmit) => {
      if (!result) {
        return;
      }

      if (result.id) {
        this.expensesPageStore.updateExpense(result.id, result.request);

        return;
      }

      this.expensesPageStore.addExpense(result.request);
    });
  }
}
