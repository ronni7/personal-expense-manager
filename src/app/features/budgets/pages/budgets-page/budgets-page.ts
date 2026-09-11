import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Budget } from '../../model/budget.model';
import { BudgetDialogComponent } from '../../components/budget-dialog/budget-dialog';
import { BudgetFormSubmit } from '../../model/budget-form-submit.model';
import { BudgetsPageStore } from '../store/budgets-page-store';
import { AuthState } from '../../../../auth/auth-state/auth.state';
import { AUTH_PERMISSIONS } from '../../../../auth/auth.permissions';

@Component({
  selector: 'app-budgets-page',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  providers: [BudgetsPageStore],
  templateUrl: './budgets-page.html',
  styleUrl: './budgets-page.scss',
})
export class BudgetsPage {
  protected readonly budgetsPageStore = inject(BudgetsPageStore);
  readonly dialog = inject(MatDialog);
  protected readonly authState = inject(AuthState);
  protected readonly AUTH_PERMISSIONS = AUTH_PERMISSIONS;

  protected openBudgetDialog(budget?: Budget): void {
    const dialogRef = this.dialog.open(BudgetDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        categories: this.budgetsPageStore.categories(),
        budget: budget ?? null,
      },
    });

    dialogRef.afterClosed().subscribe((result?: BudgetFormSubmit) => {
      if (!result) {
        return;
      }

      if (result.id) {
        this.budgetsPageStore.updateBudget(result.id, result.request);
        return;
      }

      this.budgetsPageStore.addBudget(result.request);
    });
  }

  protected deleteBudget(budget: Budget): void {
    this.budgetsPageStore.deleteBudget(budget.id);
  }

  protected onMonthChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const month = target.value;

    if (!month) {
      return;
    }

    this.budgetsPageStore.setSelectedMonth(month);
  }
}
