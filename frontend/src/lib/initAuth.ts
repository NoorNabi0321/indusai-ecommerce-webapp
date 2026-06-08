import { refreshApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/authStore';

/**
 * Attempt a silent login on app boot by exchanging the httpOnly refresh cookie
 * for a fresh access token. A 401 simply means "not logged in".
 */
export async function initializeAuth(): Promise<void> {
  const { setAuth, clearAuth, setInitializing } = useAuthStore.getState();
  try {
    const { user, accessToken } = await refreshApi();
    setAuth(user, accessToken);
  } catch {
    clearAuth();
  } finally {
    setInitializing(false);
  }
}
