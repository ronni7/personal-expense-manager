import { test } from 'vitest';
import { AuthState } from './auth.state';

test('should start in initializing state', () => {
  const state = new AuthState();

  expect(state.status()).toBe('initializing');
  expect(state.user()).toBeNull();
  expect(state.isAuthenticated()).toBe(false);
  expect(state.isAnonymous()).toBe(false);
});

test('should start in initializing state', () => {
  const state = new AuthState();

  expect(state.status()).toBe('initializing');
  expect(state.user()).toBeNull();
  expect(state.isAuthenticated()).toBe(false);
  expect(state.isAnonymous()).toBe(false);
});
test('should become authenticated', () => {
  const state = new AuthState();

  const user = {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
  };

  state.setAuthenticated(user, ['budgets:view']);

  expect(state.status()).toBe('authenticated');
  expect(state.isAuthenticated()).toBe(true);
  expect(state.isAnonymous()).toBe(false);
  expect(state.user()).toEqual(user);
  expect(state.hasPermission('budgets:view')).toBe(true);
});

test('should deny permissions the user does not have', () => {
  const state = new AuthState();

  state.setAuthenticated(
    {
      id: '1',
      username: 'demo',
      email: null,
      firstName: null,
      lastName: null,
    },
    ['budgets:view'],
  );

  expect(state.hasPermission('budgets:manage')).toBe(false);
});

test('should clear user and permissions when becoming anonymous', () => {
  const state = new AuthState();

  state.setAuthenticated(
    {
      id: '1',
      username: 'demo',
      email: null,
      firstName: null,
      lastName: null,
    },
    ['budgets:view'],
  );

  state.setAnonymous();

  expect(state.user()).toBeNull();
  expect(state.status()).toBe('anonymous');
  expect(state.isAuthenticated()).toBe(false);
  expect(state.hasPermission('budgets:view')).toBe(false);
});
