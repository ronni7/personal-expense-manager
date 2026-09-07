export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous';
