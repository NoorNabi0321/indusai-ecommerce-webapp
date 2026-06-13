import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Bell } from 'lucide-react';
import { getUnreadCount } from '@/lib/api/notification.api';
import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';

/** Prettify the last path segment, e.g. "/admin/products" -> "Products". */
function titleFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard';
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const segments = pathname.split('/').filter(Boolean);
  const title = titleFromPath(pathname);

  // Notifications live under the admin shell (Owner has access too).
  const notificationsPath = '/admin/notifications';
  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: getUnreadCount,
    staleTime: 30_000,
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-bg-base/80 px-4 backdrop-blur-glass lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-9 place-items-center rounded-md text-foreground hover:bg-accent lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-md font-semibold capitalize text-foreground">
            {title}
          </h1>
          <nav className="hidden text-xs text-muted-foreground sm:block">
            {segments.map((seg, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                <span className="capitalize">{seg.replace(/-/g, ' ')}</span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(notificationsPath)}
          className="relative grid size-9 place-items-center rounded-md text-foreground hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-gold-base px-1 text-[10px] font-bold text-bg-base">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate(pathname.startsWith('/owner') ? '/owner/settings' : '/admin/settings')}
          className="grid size-9 place-items-center overflow-hidden rounded-full bg-bg-elevated text-sm font-semibold text-gold-base"
          aria-label="Account settings"
          title={user?.name ?? 'Account'}
        >
          {user?.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : getInitials(user?.name ?? 'IA')}
        </button>
      </div>
    </header>
  );
}
