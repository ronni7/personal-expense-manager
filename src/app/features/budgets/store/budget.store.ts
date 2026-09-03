import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { Budget } from '../model/budget.model';
import { BudgetsApiService } from '../api/budget-api.service';
import { CreateBudgetRequest } from '../api/create-budget-request.model';
import { UpdateBudgetRequest } from '../api/update-budget-request.model';
import { mapBudgetDtoToBudget } from '../api/budget.mapper';

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

export const BudgetsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ budgets }) => ({
    totalBudget: computed(() =>
      budgets().reduce((total, budget) => total + budget.amountInMinorUnits, 0),
    ),
    budgetCount: computed(() => budgets().length),
  })),

  withMethods((store, budgetsApi = inject(BudgetsApiService)) => ({
    loadBudgets: rxMethod<string | undefined>(
      pipe(
        tap(() => {
          patchState(store, {
            loading: true,
            error: null,
          });
        }),
        switchMap((month) => budgetsApi.getBudgets(month ?? undefined)),
        tapResponse({
          next: (dtos) => {
            patchState(store, {
              budgets: dtos.map(mapBudgetDtoToBudget),
              loading: false,
            });
          },
          error: () => {
            patchState(store, {
              loading: false,
              error: 'Failed to load budgets.',
            });
          },
        }),
      ),
    ),

    addBudget: rxMethod<CreateBudgetRequest>(
      pipe(
        tap(() => {
          patchState(store, {
            creating: true,
            createError: null,
          });
        }),
        switchMap((request) =>
          budgetsApi.createBudget(request).pipe(
            tapResponse({
              next: (dto) => {
                const budget = mapBudgetDtoToBudget(dto);

                patchState(store, (state) => ({
                  budgets: [...state.budgets, budget],
                  creating: false,
                }));
              },
              error: () => {
                patchState(store, {
                  creating: false,
                  createError: 'Failed to create budget.',
                });
              },
            }),
          ),
        ),
      ),
    ),

    updateBudget: rxMethod<{ id: string; request: UpdateBudgetRequest }>(
      pipe(
        tap(() => {
          patchState(store, {
            updating: true,
            updateError: null,
          });
        }),
        switchMap(({ id, request }) =>
          budgetsApi.updateBudget(id, request).pipe(
            tapResponse({
              next: (dto) => {
                const budget = mapBudgetDtoToBudget(dto);

                patchState(store, (state) => ({
                  budgets: state.budgets.map((currentBudget) =>
                    currentBudget.id === budget.id ? budget : currentBudget,
                  ),
                  updating: false,
                }));
              },
              error: () => {
                patchState(store, {
                  updating: false,
                  updateError: 'Failed to update budget.',
                });
              },
            }),
          ),
        ),
      ),
    ),

    deleteBudget: rxMethod<string>(
      pipe(
        tap(() => {
          patchState(store, {
            deleting: true,
            deleteError: null,
          });
        }),
        switchMap((id) =>
          budgetsApi.deleteBudget(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  budgets: state.budgets.filter((budget) => budget.id !== id),
                  deleting: false,
                }));
              },
              error: () => {
                patchState(store, {
                  deleting: false,
                  deleteError: 'Failed to delete budget.',
                });
              },
            }),
          ),
        ),
      ),
    ),
  })),
);
