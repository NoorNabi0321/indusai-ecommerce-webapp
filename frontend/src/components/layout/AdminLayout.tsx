import { ADMIN_NAV, ADMIN_NAV_BOTTOM } from '@/lib/nav';
import { DashboardShell } from './DashboardShell';

export function AdminLayout() {
  return <DashboardShell items={ADMIN_NAV} bottomItems={ADMIN_NAV_BOTTOM} badge="Admin" />;
}
