export interface LifecycleState {
  loading: boolean;
  error: string | null;
  loaded: boolean;
}
export const initialState: LifecycleState = {
  loading: false,
  error: null,
  loaded: false,
};
