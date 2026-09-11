import { BudgetRow } from '../model/budget-row.model';

export interface KnowledgePagePlaceholdeValues {
  budgetRows: BudgetRow[];
  budgetCoverage: number;
  housingPlanned: number;
  housingActual: number;
  groceriesPlanned: number;
  groceriesActual: number;
  transportPlanned: number;
  transportActual: number;
}

export const placeholderValues = {
  budgetRows: [
    { category: 'Housing', planned: 2400, actual: 2310 },
    { category: 'Groceries', planned: 700, actual: 758 },
    { category: 'Transport', planned: 420, actual: 410 },
  ],
  budgetCoverage: 65,
  housingPlanned: 123,
  housingActual: 23,
  groceriesPlanned: 700,
  groceriesActual: 758,
  transportPlanned: 420,
  transportActual: 410,
};
