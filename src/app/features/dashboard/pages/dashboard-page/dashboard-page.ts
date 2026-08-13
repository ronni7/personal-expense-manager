import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { DashboardStore } from '../../store/dashboard.store';
@Component({
  selector: 'app-dashboard-page',
  imports: [MatCard, MatCardContent, MatCardTitle, MatCardHeader, CurrencyPipe],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected readonly dashboardStore = inject(DashboardStore);
}
