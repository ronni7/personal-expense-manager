import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Category } from '../model/category.model';

import { CategoriesApiService } from '../api/category-api.service';
import { withLifecycleState } from '../../../shared/call-state/lifecycle-state.feature';

interface CategoriesState {
  categories: Category[];
}

const initialState: CategoriesState = {
  categories: [],
};

export const CategoriesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),
  withLifecycleState(),
  withMethods((store, categoriesApi = inject(CategoriesApiService)) => ({
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => {
          store.setLoadingState();
        }),
        switchMap(() => categoriesApi.getCategories()),
        tapResponse({
          next: (categories) => {
            patchState(store, {
              categories,
            });
            store.setLoadedState();
          },
          error: () => store.setNotLoadingErrorState('Failed to load categories.'),
        }),
      ),
    ),
  })),

  withMethods((store) => ({
    ensureLoaded(): void {
      if (store.loaded() || store.loading()) {
        return;
      }
      store.loadCategories();
    },
  })),
);
