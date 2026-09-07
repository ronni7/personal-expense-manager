import { computed, Injectable, signal } from '@angular/core';
import type { AuthUser, AuthStatus } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly _status = signal<AuthStatus>('initializing');
  private readonly _user = signal<AuthUser | null>(null);

  readonly status = this._status.asReadonly();
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._status() === 'authenticated');

  readonly isAnonymous = computed(() => this._status() === 'anonymous');

  setAuthenticated(user: AuthUser): void {
    this._user.set(user);
    this._status.set('authenticated');
  }

  setAnonymous(): void {
    this._user.set(null);
    this._status.set('anonymous');
  }

  reset(): void {
    this._user.set(null);
    this._status.set('initializing');
  }
}
