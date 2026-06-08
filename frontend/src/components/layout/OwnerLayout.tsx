import { OWNER_NAV, OWNER_NAV_BOTTOM } from '@/lib/nav';
import { DashboardShell } from './DashboardShell';

export function OwnerLayout() {
  return <DashboardShell items={OWNER_NAV} bottomItems={OWNER_NAV_BOTTOM} badge="Owner" />;
}
