import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';

import { initialState } from './model/lifecycle-state.model';

export function withLifecycleState() {
  return signalStoreFeature(
    withState(initialState),

    withMethods((store) => ({
      setLoadingState(): void {
        patchState(store, {
          loading: true,
          error: null,
        });
      },

      setLoadedState(): void {
        patchState(store, {
          loading: false,
          loaded: true,
        });
      },

      setNotLoadingErrorState(error: string): void {
        patchState(store, {
          loading: false,
          error,
        });
      },

      resetLifecycle(): void {
        patchState(store, initialState);
      },
    })),
  );
}
