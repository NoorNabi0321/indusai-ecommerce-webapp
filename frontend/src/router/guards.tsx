import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/user.types';

/**
 * Auth enforcement is live (Phase 2.5): guards check the auth store, which is
 * hydrated on boot by the silent-refresh in initializeAuth().
 */

/** Full-screen loader shown while the initial silent-refresh resolves. */
function AuthLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg-base">
      <Loader2 className="size-8 animate-spin text-gold-base" />
    </div>
  );
}

/** Redirects authenticated users away from guest-only pages (login, register…). */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Requires an authenticated user; otherwise redirects to login (remembering origin). */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();

  if (isInitializing) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/** Requires an authenticated user whose role is in `roles`. */
export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  if (isInitializing) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }
  if (!role || !roles.includes(role)) {
    return <Navigate to="/admin/403" replace />;
  }
  return <Outlet />;
}
