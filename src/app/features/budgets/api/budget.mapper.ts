import { Budget } from '../model/budget.model';
import { BudgetDto } from './budget.dto';

export function mapBudgetDtoToBudget(dto: BudgetDto): Budget {
  return {
    id: dto.id,
    categoryId: dto.categoryId,
    month: dto.month,
    amountInMinorUnits: dto.amountInMinorUnits,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
