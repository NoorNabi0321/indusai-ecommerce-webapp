import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';

export interface AuditLogRow {
  id: string;
  action: string;
  target: string | null;
  targetId: string | null;
  ipAddress: string | null;
  createdAt: string;
  actorRole: string;
  actorId: string;
  actorName: string;
}

export interface AuditFilters {
  actions: string[];
  actors: { id: string; name: string; role: string }[];
}

export async function listAuditLogs(
  params: { actorId?: string; action?: string; from?: string; to?: string; page?: number; limit?: number } = {},
): Promise<{ items: AuditLogRow[]; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<AuditLogRow[]>>('/owner/audit', { params });
  return { items: data.data, pagination: data.pagination! };
}

export async function getAuditFilters(): Promise<AuditFilters> {
  const { data } = await api.get<ApiSuccess<AuditFilters>>('/owner/audit/filters');
  return data.data;
}
