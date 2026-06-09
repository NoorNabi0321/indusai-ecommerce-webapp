import { useEffect } from 'react';
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

const ICONS: Record<NotificationType, { icon: typeof Info; color: string }> = {
  ORDER_UPDATE: { icon: Package, color: 'text-info' },
  PROMOTION: { icon: Tag, color: 'text-gold-base' },
  ACCOUNT: { icon: ShieldAlert, color: 'text-warning' },
  SYSTEM: { icon: Info, color: 'text-muted-foreground' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => getNotifications(1, 30) });

  useEffect(() => {
    document.title = `Notifications · ${APP_NAME}`;
  }, []);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['notifications'] });
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
  };
  const readMut = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const allMut = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  const items = data?.items ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  if (isLoading) return <div className="skeleton h-40 rounded-xl" />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Notifications</h2>
        {hasUnread && (
          <Button size="sm" variant="outline" onClick={() => allMut.mutate()}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-surface py-20 text-center">
          <Bell className="size-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You're all caught up — no notifications.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg-surface">
          {items.map((n) => {
            const { icon: Icon, color } = ICONS[n.type];
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
  );
}
