import { computed, Injectable, signal } from '@angular/core';
import type { AuthUser, AuthStatus } from './auth.types';
import { AuthPermission } from './auth.permissions';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly _status = signal<AuthStatus>('initializing');
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _roles = signal<ReadonlySet<string>>(new Set());

  readonly status = this._status.asReadonly();
  readonly user = this._user.asReadonly();
  readonly roles = this._roles.asReadonly();

  readonly isAuthenticated = computed(() => this._status() === 'authenticated');

  readonly isAnonymous = computed(() => this._status() === 'anonymous');

  hasPermission(permission: AuthPermission): boolean {
    return this._roles().has(permission);
  }

  setAuthenticated(user: AuthUser, roles: Iterable<string>): void {
    this._user.set(user);
    this._roles.set(new Set(roles));
    this._status.set('authenticated');
  }

  setAnonymous(): void {
    this._user.set(null);
    this._roles.set(new Set());
    this._status.set('anonymous');
  }

  reset(): void {
    this._user.set(null);
    this._roles.set(new Set());
    this._status.set('initializing');
  }
}
