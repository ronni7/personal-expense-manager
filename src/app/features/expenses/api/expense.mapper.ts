import { Injectable } from '@angular/core';

@Injectable()
export class ExpenseMapper {}

import { ExpenseDto } from './expense.dto';
import { Expense } from '../model/expense.model';

export function mapExpenseDtoToExpense(dto: ExpenseDto): Expense {
  return {
    id: dto.id,
    amountInMinorUnits: dto.amountInMinorUnits,
    currency: dto.currency,
    description: dto.description,
    categoryId: dto.categoryId,
    date: dto.date,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
