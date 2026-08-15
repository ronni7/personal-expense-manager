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
  ],
  providers: [ExpensesPageStore],
  templateUrl: './expenses-page.html',
  styleUrl: './expenses-page.scss',
})
export class ExpensesPage {
  protected readonly displayedColumns = ['date', 'description', 'category', 'amount'];
  protected readonly expensesPageStore = inject(ExpensesPageStore);
}
