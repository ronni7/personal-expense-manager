import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { ExpensesStore } from '../../../expenses/store/expense.store';
@Component({
  selector: 'app-dashboard-page',
  imports: [MatCard, MatCardContent, MatCardTitle, MatCardHeader],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  expenseStore = inject(ExpensesStore);

  constructor() {
    this.expenseStore.loadExpenses();
  }
}
