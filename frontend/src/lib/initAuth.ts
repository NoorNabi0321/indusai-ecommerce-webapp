import { refreshApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/authStore';

let initPromise: Promise<void> | null = null;

/**
 * Attempt a silent login on app boot by exchanging the httpOnly refresh cookie
 * for a fresh access token. A 401 simply means "not logged in".
 *
 * Single-flight: because the refresh endpoint rotates the cookie, running this
 * twice (e.g. React StrictMode's double effect invocation) would send the
 * already-rotated token on the second call and fail. The cached promise ensures
 * exactly one refresh happens per app load.
 */
export function initializeAuth(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { setAuth, clearAuth, setInitializing } = useAuthStore.getState();
    try {
      const { user, accessToken } = await refreshApi();
      setAuth(user, accessToken);
    } catch {
      clearAuth();
    } finally {
      setInitializing(false);
    }
  })();

  return initPromise;
}
