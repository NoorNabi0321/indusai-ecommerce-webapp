import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface ActivityEntry {
  id: string;
  action: string;
  target: string | null;
  targetId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export async function getMyActivity(limit = 20): Promise<ActivityEntry[]> {
  const { data } = await api.get<ApiSuccess<ActivityEntry[]>>('/admin/activity', { params: { limit } });
  return data.data;
}
