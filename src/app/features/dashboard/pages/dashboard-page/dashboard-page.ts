import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { ExpensesStore } from '../../../expenses/store/expense.store';
import { DashboardStore } from '../../store/dashboard.store';
import { CategoriesStore } from '../../../categories/store/category.store';
import { CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-dashboard-page',
  imports: [MatCard, MatCardContent, MatCardTitle, MatCardHeader, CurrencyPipe],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  expenseStore = inject(ExpensesStore); // temporary solution until we have a better way to handle store injection
  categoriesStore = inject(CategoriesStore);
  protected readonly dashboardStore = inject(DashboardStore);

  constructor() {
    this.expenseStore.loadExpenses();
    this.categoriesStore.loadCategories();
  }
}
