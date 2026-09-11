import { CurrencyPipe } from '@angular/common';
import { Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BudgetRow } from '../../model/budget-row.model';
import { placeholderValues } from '../knowledge-page-placeholder-values';

@Component({
  selector: 'app-knowledge-page',
  templateUrl: './knowledge-page.html',
  styleUrl: './knowledge-page.scss',
  imports: [RouterLink, FormsModule, CurrencyPipe],
})
export class KnowledgePage {
  protected readonly currencyPipe = new CurrencyPipe('pl-PL', 'PLN');
  protected readonly selectedCurrency = this.currencyPipe.transform(1)?.split(/(\s+)/).pop();
  protected budgetRows: BudgetRow[] = placeholderValues.budgetRows;

  protected budgetCoverage = placeholderValues.budgetCoverage;
  housingPlanned = model(placeholderValues.housingPlanned);
  housingActual = model(placeholderValues.housingActual);
  housingCalculated = computed(() => {
    return this.housingPlanned() - this.housingActual();
  });

  groceriesPlanned = model(placeholderValues.groceriesPlanned);
  groceriesActual = model(placeholderValues.groceriesActual);
  groceriesCalculated = computed(() => {
    return this.groceriesPlanned() - this.groceriesActual();
  });

  transportPlanned = model(placeholderValues.transportPlanned);
  transportActual = model(placeholderValues.transportActual);
  transportCalculated = computed(() => {
    return this.transportPlanned() - this.transportActual();
  });

  protected onRangeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.budgetCoverage = Number(target.value || placeholderValues.budgetCoverage);
  }

  protected onSubmit(form: HTMLFormElement, event: SubmitEvent, dialog: HTMLDialogElement): void {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    dialog.showModal();
  }

  protected getDifference(row: BudgetRow): number {
    return row.planned - row.actual;
  }

  protected getColumnTotal(column: 'planned' | 'actual' | 'difference'): number {
    return this.budgetRows.reduce((sum, row) => {
      if (column === 'planned') return sum + row.planned;
      if (column === 'actual') return sum + row.actual;

      return sum + (row.planned - row.actual);
    }, 0);
  }

  scrollTo(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
