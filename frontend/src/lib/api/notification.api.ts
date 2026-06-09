import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';

export type NotificationType = 'ORDER_UPDATE' | 'PROMOTION' | 'ACCOUNT' | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export async function getNotifications(
  page = 1,
  limit = 20,
): Promise<{ items: AppNotification[]; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<AppNotification[]>>('/notifications', {
    params: { page, limit },
  });
  return { items: data.data, pagination: data.pagination! };
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiSuccess<{ count: number }>>('/notifications/unread-count');
  return data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}
