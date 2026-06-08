import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  loginApi,
  logoutApi,
  registerApi,
  verifyEmailApi,
  resendVerificationApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '@/lib/api/auth.api';
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

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { user: u, accessToken } = await loginApi(email, password);
      setAuth(u, accessToken);
      return u;
    },
    [setAuth],
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
    (userId: string, otp: string, password: string): Promise<void> =>
      resetPasswordApi(userId, otp, password),
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
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
  };
}
