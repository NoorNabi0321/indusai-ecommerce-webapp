import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  loginApi,
  verifyTwoFactorApi,
  logoutApi,
  registerApi,
  verifyEmailApi,
  resendVerificationApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '@/lib/api/auth.api';
import { mergeCart } from '@/lib/api/cart.api';
import { useCartStore } from '@/stores/cartStore';
import { queryClient } from '@/lib/queryClient';
import type { RegisterPayload, User } from '@/types/user.types';

/**
 * Auth actions + state for components. Thin wrapper over the API layer and the
 * Zustand store; keeps token handling out of the components.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Stores the session, then merges any guest cart into the server cart.
  const finishSession = useCallback(
    async (u: User, accessToken: string): Promise<User> => {
      setAuth(u, accessToken);
      const guest = useCartStore.getState().guestItems;
      if (guest.length > 0) {
        try {
          await mergeCart(guest.map((g) => ({ productId: g.productId, variantId: g.variantId, quantity: g.quantity })));
          useCartStore.getState().clearGuest();
        } catch {
          // Non-fatal — keep the guest cart if merge fails.
        }
      }
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      return u;
    },
    [setAuth],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { user: u, accessToken } = await loginApi(email, password);
      return finishSession(u, accessToken);
    },
    [finishSession],
  );

  // Completes a login that was challenged for a 2FA code.
  const verifyTwoFactor = useCallback(
    async (userId: string, token: string): Promise<User> => {
      const { user: u, accessToken } = await verifyTwoFactorApi(userId, token);
      return finishSession(u, accessToken);
    },
    [finishSession],
  );

  const register = useCallback(
    (payload: RegisterPayload): Promise<User> => registerApi(payload),
    [],
  );

  const verifyEmail = useCallback(
    (userId: string, otp: string): Promise<User> => verifyEmailApi(userId, otp),
    [],
  );

  const resendVerification = useCallback(
    (userId: string): Promise<void> => resendVerificationApi(userId),
    [],
  );

  const forgotPassword = useCallback(
    (email: string): Promise<void> => forgotPasswordApi(email),
    [],
  );

  const resetPassword = useCallback(
    (email: string, otp: string, password: string): Promise<void> =>
      resetPasswordApi(email, otp, password),
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    role,
    isAuthenticated,
    isInitializing,
    login,
    verifyTwoFactor,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
  };
}
