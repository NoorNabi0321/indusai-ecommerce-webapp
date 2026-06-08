import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/user.types';

/**
 * TEMP — preview bypass.
 * Until Phase 2.5 wires real authentication, this lets us browse the protected
 * Customer-account, Admin, and Owner shells. Phase 2.5 MUST set this to `false`
 * (or remove it) so the guards enforce auth/role for real.
 * TODO(Phase 2.5): remove preview bypass.
 */
const PREVIEW_BYPASS = true;

/** Redirects authenticated users away from guest-only pages (login, register…). */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!PREVIEW_BYPASS && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

/** Requires an authenticated user; otherwise redirects to login (remembering origin). */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!PREVIEW_BYPASS && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/** Requires an authenticated user whose role is in `roles`. */
export function RoleRoute({ roles }: { roles: UserRole[] }) {
  // Select primitives individually — returning a new object here would change the
  // store snapshot on every render and trigger an infinite update loop (Zustand v5).
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  if (PREVIEW_BYPASS) return <Outlet />;

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }
  if (!role || !roles.includes(role)) {
    return <Navigate to="/admin/403" replace />;
  }
  return <Outlet />;
}
