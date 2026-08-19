import { Component, inject } from '@angular/core';
import { ExpensesPageStore } from '../store/expenses-page-store';
import {
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
} from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';
import { EXPENSE_TABLE_COLUMNS, ExpenseTableColumn } from './expense-table-columns';
import { Sort } from '@angular/material/sort';
import { MatSort, MatSortHeader } from '@angular/material/sort';
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
  ],
  providers: [ExpensesPageStore],
  templateUrl: './expenses-page.html',
  styleUrl: './expenses-page.scss',
})
export class ExpensesPage {
  protected readonly expensesPageStore = inject(ExpensesPageStore);
  protected readonly displayedColumns: readonly ExpenseTableColumn[] = EXPENSE_TABLE_COLUMNS;

  protected onSortChange(sort: Sort): void {
    this.expensesPageStore.setSort(sort);
  }
}
