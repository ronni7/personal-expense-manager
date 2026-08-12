import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Category } from '../model/category.model';

import { CategoriesApiService } from '../api/category-api.service';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const CategoriesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store, categoriesApi = inject(CategoriesApiService)) => ({
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            loading: true,
            error: null,
          });
        }),
        switchMap(() => categoriesApi.getCategories()),
        tapResponse({
          next: (categories) => {
            patchState(store, {
              categories,
              loading: false,
            });
          },
          error: () => {
            patchState(store, {
              loading: false,
              error: 'Failed to load categories.',
            });
          },
        }),
      ),
    ),
  })),
);
