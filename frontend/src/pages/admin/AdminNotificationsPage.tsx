import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Bell, Package, Tag, ShieldAlert, Info, CheckCheck } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationType,
} from '@/lib/api/notification.api';
import { Button } from '@/components/ui/button';

const META: Record<NotificationType, { icon: typeof Info; color: string; label: string; desc: string }> = {
  ORDER_UPDATE: { icon: Package, color: 'text-info', label: 'Order Updates', desc: 'New orders and status changes' },
  PROMOTION: { icon: Tag, color: 'text-gold-base', label: 'Promotions', desc: 'Campaigns and marketing alerts' },
  ACCOUNT: { icon: ShieldAlert, color: 'text-warning', label: 'Account & Security', desc: 'Sign-ins and account changes' },
  SYSTEM: { icon: Info, color: 'text-muted-foreground', label: 'System', desc: 'Inventory, deletions and platform alerts' },
};
const CATEGORIES = Object.keys(META) as NotificationType[];

const PREF_KEY = 'indusai_admin_notif_prefs';
type Prefs = Record<NotificationType, boolean>;
const DEFAULT_PREFS: Prefs = { ORDER_UPDATE: true, PROMOTION: true, ACCOUNT: true, SYSTEM: true };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function AdminNotificationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    document.title = `Notifications · ${APP_NAME} Admin`;
  }, []);

  const { data, isLoading } = useQuery({ queryKey: ['admin-notifications'], queryFn: () => getNotifications(1, 30) });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin-notifications'] });
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
  };
  const readMut = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const allMut = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  function togglePref(cat: NotificationType) {
    setPrefs((p) => {
      const next = { ...p, [cat]: !p[cat] };
      localStorage.setItem(PREF_KEY, JSON.stringify(next));
      return next;
    });
  }

  // Respect device preferences in the displayed feed.
  const allItems = data?.items ?? [];
  const items = allItems.filter((n) => prefs[n.type]);
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Bell className="size-5 text-gold-base" />
        <h1 className="font-display text-xl font-bold text-foreground">Notifications</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Feed */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-md font-semibold text-foreground">Recent</h2>
            {hasUnread && (
              <Button size="sm" variant="outline" onClick={() => allMut.mutate()}>
                <CheckCheck className="size-4" /> Mark all read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="skeleton h-40 rounded-xl" />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-surface py-20 text-center">
              <Bell className="size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {allItems.length === 0 ? "You're all caught up — no notifications." : 'No notifications in your enabled categories.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg-surface">
              {items.map((n) => {
                const { icon: Icon, color } = META[n.type];
                return (
                  <li
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) readMut.mutate(n.id);
                      if (n.link) navigate(n.link);
                    }}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-bg-elevated',
                      !n.isRead && 'bg-bg-elevated/50',
                    )}
                  >
                    <span className={cn('mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-bg-elevated', color)}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {n.title}
                        {!n.isRead && <span className="size-2 rounded-full bg-gold-base" />}
                      </p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Preferences */}
        <aside>
          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <h2 className="font-display text-md font-semibold text-foreground">Preferences</h2>
            <p className="mb-4 mt-1 text-xs text-muted-foreground">Choose which categories appear in your feed. Saved on this device.</p>
            <ul className="space-y-4">
              {CATEGORIES.map((cat) => {
                const { icon: Icon, color, label, desc } = META[cat];
                return (
                  <li key={cat} className="flex items-start gap-3">
                    <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-bg-elevated', color)}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={prefs[cat]}
                      aria-label={`Toggle ${label}`}
                      onClick={() => togglePref(cat)}
                      className={cn(
                        'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors',
                        prefs[cat] ? 'bg-gold-base' : 'bg-bg-overlay',
                      )}
                    >
                      <span className={cn('absolute top-0.5 size-4 rounded-full bg-white transition-transform', prefs[cat] ? 'translate-x-4' : 'translate-x-0.5')} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
