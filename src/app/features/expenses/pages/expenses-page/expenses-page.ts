import { CurrencyPipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
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
import { CreateExpenseRequest } from '../../api/create-expense-request.model';
import { CreateExpenseDialogComponent } from '../../components/create-expense-dialog/create-expense-dialog';

import { ExpensesPageStore } from '../store/expenses-page-store';
import { EXPENSE_TABLE_COLUMNS, ExpenseTableColumn } from './expense-table-columns';
import { CreateExpenseDialogData } from '../../model/create-expense-dialog-data.model';

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
  ],
  providers: [ExpensesPageStore],
  templateUrl: './expenses-page.html',
  styleUrl: './expenses-page.scss',
})
export class ExpensesPage {
  protected readonly expensesPageStore = inject(ExpensesPageStore);
  protected readonly displayedColumns: readonly ExpenseTableColumn[] = EXPENSE_TABLE_COLUMNS;
  private readonly dialog = inject(MatDialog);
  private readonly data = inject<CreateExpenseDialogData | undefined>(MAT_DIALOG_DATA, {
    optional: true,
  });
  readonly createExpenseCancel = output<void>();

  protected readonly categories = this.data?.categories ?? [];

  protected onSortChange(sort: Sort): void {
    this.expensesPageStore.setSort(sort);
  }

  protected onSearchQueryChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.expensesPageStore.setSearchQuery(input.value);
  }

  protected onCreateExpense(request: CreateExpenseRequest): void {
    this.expensesPageStore.addExpense(request);
  }

  protected openCreateExpenseDialog(): void {
    const dialogRef = this.dialog.open(CreateExpenseDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      height: 'min(800px, 95vh)',
      panelClass: 'expense-create-dialog',
      data: {
        categories: this.expensesPageStore.categories(),
      },
    });

    dialogRef.afterClosed().subscribe((request?: CreateExpenseRequest) => {
      if (!request) {
        return;
      }

      this.expensesPageStore.addExpense(request);
    });
  }
}
