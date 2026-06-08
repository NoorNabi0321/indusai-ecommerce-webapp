import { create } from 'zustand';
import type { User, UserRole } from '@/types/user.types';

/**
 * Auth state. The access token lives only in memory (never localStorage) — the
 * refresh token is an httpOnly cookie the browser sends automatically. On boot,
 * `initializeAuth()` exchanges that cookie for a fresh access token.
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  /** True until the initial silent-refresh attempt resolves. */
  isInitializing: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, role: user.role, isAuthenticated: true }),
  setUser: (user) => set({ user, role: user.role }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () =>
    set({ user: null, accessToken: null, role: null, isAuthenticated: false }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
