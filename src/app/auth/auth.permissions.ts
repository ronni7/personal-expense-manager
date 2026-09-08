export const AUTH_PERMISSIONS = {
  expenses: {
    view: 'expenses:view',
    edit: 'expenses:edit',
  },

  budgets: {
    view: 'budgets:view',
    manage: 'budgets:manage',
  },
} as const;

export type AuthPermission = 'expenses:view' | 'expenses:edit' | 'budgets:view' | 'budgets:manage';
