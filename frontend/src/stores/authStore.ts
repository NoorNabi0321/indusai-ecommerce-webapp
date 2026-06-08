import { create } from 'zustand';
import type { User, UserRole } from '@/types/user.types';

/**
 * Minimal auth store for the routing shell (Phase 1.4).
 * Actions (login/logout/refresh), persistence, and API wiring are added in
 * Phase 2.4. For now it simply holds the current user / auth flags.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  role: null,
}));
