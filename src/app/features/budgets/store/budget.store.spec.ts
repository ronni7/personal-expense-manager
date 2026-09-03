import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { unprotected } from '@ngrx/signals/testing';
import { BudgetsApiService } from '../api/budget-api.service';
import { BudgetDto } from '../api/budget.dto';
import { CreateBudgetRequest } from '../api/create-budget-request.model';
import { UpdateBudgetRequest } from '../api/update-budget-request.model';
import { Budget } from '../model/budget.model';
import { BudgetsStore } from './budget.store';

const apiMock = {
  getBudgets: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
};

const budgetDto1: BudgetDto = {
  id: 'budget-1',
  categoryId: 'food',
  month: '2026-08',
  amountInMinorUnits: 10000,
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-01T10:00:00Z',
};

const budgetDto2: BudgetDto = {
  id: 'budget-2',
  categoryId: 'bills',
  month: '2026-08',
  amountInMinorUnits: 15000,
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-01T10:00:00Z',
};

const budget1: Budget = {
  id: 'budget-1',
  categoryId: 'food',
  month: '2026-08',
  amountInMinorUnits: 10000,
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-01T10:00:00Z',
};

const budget2: Budget = {
  id: 'budget-2',
  categoryId: 'bills',
  month: '2026-08',
  amountInMinorUnits: 15000,
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-01T10:00:00Z',
};

describe('BudgetsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        BudgetsStore,
        {
          provide: BudgetsApiService,
          useValue: apiMock,
        },
      ],
    });
  });

  describe('initial state', () => {
    test('should have empty budgets', () => {
      const store = TestBed.inject(BudgetsStore);

      expect(store.budgets()).toEqual([]);
    });

    test('should have initial loading state disabled', () => {
      const store = TestBed.inject(BudgetsStore);

      expect(store.loading()).toBe(false);
    });

    test('should have initial mutation states disabled', () => {
      const store = TestBed.inject(BudgetsStore);

      expect(store.creating()).toBe(false);
      expect(store.updating()).toBe(false);
      expect(store.deleting()).toBe(false);
    });

    test('should have no errors', () => {
      const store = TestBed.inject(BudgetsStore);

      expect(store.error()).toBeNull();
      expect(store.createError()).toBeNull();
      expect(store.updateError()).toBeNull();
      expect(store.deleteError()).toBeNull();
    });
  });

  describe('derived state', () => {
    test('should calculate total budget', () => {
      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      expect(store.totalBudget()).toBe(25000);
    });

    test('should calculate budget count', () => {
      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      expect(store.budgetCount()).toBe(2);
    });

    test('should recalculate derived state when budgets change', () => {
      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1],
      });

      expect(store.totalBudget()).toBe(10000);
      expect(store.budgetCount()).toBe(1);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      expect(store.totalBudget()).toBe(25000);
      expect(store.budgetCount()).toBe(2);
    });
  });

  describe('loadBudgets', () => {
    test('should load budgets successfully', () => {
      const response$ = new Subject<BudgetDto[]>();
      apiMock.getBudgets.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      store.loadBudgets('2026-08');

      expect(store.loading()).toBe(true);
      expect(store.error()).toBeNull();

      response$.next([budgetDto1, budgetDto2]);
      response$.complete();

      expect(apiMock.getBudgets).toHaveBeenCalledWith('2026-08');
      expect(store.budgets()).toEqual([budget1, budget2]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    test('should load all budgets when month is not provided', () => {
      const response$ = new Subject<BudgetDto[]>();
      apiMock.getBudgets.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      store.loadBudgets('');

      expect(apiMock.getBudgets).toHaveBeenCalledWith('');

      response$.next([budgetDto1]);
      response$.complete();

      expect(store.budgets()).toEqual([budget1]);
    });

    test('should clear previous load error when loading again', () => {
      const store = TestBed.inject(BudgetsStore);
      patchState(unprotected(store), {
        error: 'Previous error',
      });
      const response$ = new Subject<BudgetDto[]>();

      vi.mocked(apiMock.getBudgets).mockReturnValue(response$);

      store.loadBudgets('2026-08');

      expect(store.error()).toBeNull();
      expect(store.loading()).toBe(true);
    });

    test('should preserve existing budgets when loading fails', () => {
      apiMock.getBudgets.mockReturnValue(throwError(() => new Error('Network error')));

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.loadBudgets('2026-08');

      expect(store.budgets()).toEqual([budget1, budget2]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to load budgets.');
    });

    test('should ignore previous load when a newer load is triggered', () => {
      const firstResponse$ = new Subject<BudgetDto[]>();
      const secondResponse$ = new Subject<BudgetDto[]>();

      apiMock.getBudgets.mockReturnValueOnce(firstResponse$).mockReturnValueOnce(secondResponse$);

      const store = TestBed.inject(BudgetsStore);

      store.loadBudgets('2026-07');
      store.loadBudgets('2026-08');

      secondResponse$.next([budgetDto2]);
      secondResponse$.complete();

      firstResponse$.next([budgetDto1]);
      firstResponse$.complete();

      expect(store.budgets()).toEqual([budget2]);
    });
  });

  describe('addBudget', () => {
    const request: CreateBudgetRequest = {
      categoryId: 'food',
      month: '2026-09',
      amountInMinorUnits: 20000,
    };

    const createdBudgetDto: BudgetDto = {
      id: 'budget-new',
      categoryId: 'food',
      month: '2026-09',
      amountInMinorUnits: 20000,
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    };

    test('should start creating state and send request to API', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.createBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      store.addBudget(request);

      expect(apiMock.createBudget).toHaveBeenCalledWith(request);
      expect(store.creating()).toBe(true);
      expect(store.createError()).toBeNull();
    });

    test('should add mapped budget to state on success', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.createBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      store.addBudget(request);

      response$.next(createdBudgetDto);
      response$.complete();

      const expectedCreatedBudget: Budget = {
        id: 'budget-new',
        categoryId: 'food',
        month: '2026-09',
        amountInMinorUnits: 20000,
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-01T10:00:00Z',
      };

      expect(store.budgets()).toEqual([expectedCreatedBudget]);
      expect(store.creating()).toBe(false);
      expect(store.createError()).toBeNull();
    });

    test('should preserve existing budgets when creating succeeds', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.createBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1],
      });

      store.addBudget(request);

      response$.next(createdBudgetDto);
      response$.complete();

      const expectedCreatedBudget: Budget = {
        id: 'budget-new',
        categoryId: 'food',
        month: '2026-09',
        amountInMinorUnits: 20000,
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-01T10:00:00Z',
      };

      expect(store.budgets()).toEqual([budget1, expectedCreatedBudget]);
      expect(store.creating()).toBe(false);
      expect(store.createError()).toBeNull();
    });

    test('should expose create error when API fails', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.createBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1],
      });

      store.addBudget(request);
      response$.error(new Error('Create failed'));

      expect(store.budgets()).toEqual([budget1]);
      expect(store.creating()).toBe(false);
      expect(store.createError()).toBe('Failed to create budget.');
    });

    test('should clear previous create error when retrying', () => {
      const firstResponse$ = new Subject<BudgetDto>();
      const secondResponse$ = new Subject<BudgetDto>();

      apiMock.createBudget.mockReturnValueOnce(firstResponse$).mockReturnValueOnce(secondResponse$);

      const store = TestBed.inject(BudgetsStore);

      store.addBudget(request);
      firstResponse$.error(new Error('Create failed'));

      expect(store.createError()).toBe('Failed to create budget.');

      store.addBudget(request);

      expect(store.createError()).toBeNull();
      expect(store.creating()).toBe(true);

      secondResponse$.next(createdBudgetDto);
      secondResponse$.complete();

      expect(store.createError()).toBeNull();
      expect(store.creating()).toBe(false);
    });
  });

  describe('updateBudget', () => {
    const request: UpdateBudgetRequest = {
      categoryId: 'food',
      month: '2026-08',
      amountInMinorUnits: 25000,
    };

    const updatedBudgetDto: BudgetDto = {
      ...budgetDto1,
      amountInMinorUnits: 25000,
      updatedAt: '2026-08-20T10:00:00Z',
    };

    test('should start updating state and send request with id', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.updateBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      store.updateBudget({
        id: budget1.id,
        request,
      });

      expect(apiMock.updateBudget).toHaveBeenCalledWith(budget1.id, request);
      expect(store.updating()).toBe(true);
      expect(store.updateError()).toBeNull();
    });

    test('should replace the correct budget with mapped response', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.updateBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.updateBudget({
        id: budget1.id,
        request,
      });

      response$.next(updatedBudgetDto);
      response$.complete();

      const expectedUpdatedBudget: Budget = {
        ...budget1,
        amountInMinorUnits: 25000,
        updatedAt: '2026-08-20T10:00:00Z',
      };

      expect(store.budgets()).toEqual([expectedUpdatedBudget, budget2]);
      expect(store.updating()).toBe(false);
      expect(store.updateError()).toBeNull();
    });

    test('should preserve all other budgets when updating', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.updateBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.updateBudget({
        id: budget1.id,
        request,
      });

      response$.next(updatedBudgetDto);
      response$.complete();

      expect(store.budgets()[1]).toEqual(budget2);
    });

    test('should expose update error and preserve state when API fails', () => {
      const response$ = new Subject<BudgetDto>();
      apiMock.updateBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.updateBudget({
        id: budget1.id,
        request,
      });

      response$.error(new Error('Update failed'));

      expect(store.budgets()).toEqual([budget1, budget2]);
      expect(store.updating()).toBe(false);
      expect(store.updateError()).toBe('Failed to update budget.');
    });

    test('should clear previous update error when retrying', () => {
      const firstResponse$ = new Subject<BudgetDto>();
      const secondResponse$ = new Subject<BudgetDto>();

      apiMock.updateBudget.mockReturnValueOnce(firstResponse$).mockReturnValueOnce(secondResponse$);

      const store = TestBed.inject(BudgetsStore);

      store.updateBudget({
        id: budget1.id,
        request,
      });

      firstResponse$.error(new Error('Update failed'));

      expect(store.updateError()).toBe('Failed to update budget.');

      store.updateBudget({
        id: budget1.id,
        request,
      });

      expect(store.updateError()).toBeNull();
      expect(store.updating()).toBe(true);

      secondResponse$.next(updatedBudgetDto);
      secondResponse$.complete();

      expect(store.updateError()).toBeNull();
      expect(store.updating()).toBe(false);
    });
  });

  describe('deleteBudget', () => {
    test('should start deleting state and send id to API', () => {
      const response$ = new Subject<void>();
      apiMock.deleteBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      store.deleteBudget(budget1.id);

      expect(apiMock.deleteBudget).toHaveBeenCalledWith(budget1.id);
      expect(store.deleting()).toBe(true);
      expect(store.deleteError()).toBeNull();
    });

    test('should remove the correct budget on success', () => {
      const response$ = new Subject<void>();
      apiMock.deleteBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.deleteBudget(budget1.id);

      response$.next();
      response$.complete();

      expect(store.budgets()).toEqual([budget2]);
      expect(store.deleting()).toBe(false);
      expect(store.deleteError()).toBeNull();
    });

    test('should preserve other budgets when deleting', () => {
      const response$ = new Subject<void>();
      apiMock.deleteBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.deleteBudget(budget1.id);

      response$.next();
      response$.complete();

      expect(store.budgets()[0]).toEqual(budget2);
    });

    test('should expose delete error and preserve state when API fails', () => {
      const response$ = new Subject<void>();
      apiMock.deleteBudget.mockReturnValue(response$);

      const store = TestBed.inject(BudgetsStore);

      patchState(unprotected(store), {
        budgets: [budget1, budget2],
      });

      store.deleteBudget(budget1.id);

      response$.error(new Error('Delete failed'));

      expect(store.budgets()).toEqual([budget1, budget2]);
      expect(store.deleting()).toBe(false);
      expect(store.deleteError()).toBe('Failed to delete budget.');
    });

    test('should clear previous delete error when retrying', () => {
      const firstResponse$ = new Subject<void>();
      const secondResponse$ = new Subject<void>();

      apiMock.deleteBudget.mockReturnValueOnce(firstResponse$).mockReturnValueOnce(secondResponse$);

      const store = TestBed.inject(BudgetsStore);

      store.deleteBudget(budget1.id);
      firstResponse$.error(new Error('Delete failed'));

      expect(store.deleteError()).toBe('Failed to delete budget.');

      store.deleteBudget(budget1.id);

      expect(store.deleteError()).toBeNull();
      expect(store.deleting()).toBe(true);

      secondResponse$.next();
      secondResponse$.complete();

      expect(store.deleteError()).toBeNull();
      expect(store.deleting()).toBe(false);
    });
  });
});
