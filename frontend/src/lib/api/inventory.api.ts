import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';

export type AlertLevel = 'critical' | 'low' | 'moderate' | 'healthy';

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  price: number | null;
  isActive: boolean;
  level: AlertLevel;
}

export interface InventorySummary {
  critical: number;
  low: number;
  moderate: number;
  alerts: number;
}

export interface BulkUpdateResult {
  updated: number;
  notFound: string[];
}

export async function listInventory(
  params: { search?: string; level?: AlertLevel; includeHealthy?: boolean; page?: number; limit?: number } = {},
): Promise<{ items: InventoryRow[]; summary: InventorySummary; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<InventoryRow[]> & { meta: { summary: InventorySummary } }>(
    '/admin/inventory',
    { params },
  );
  return { items: data.data, summary: data.meta.summary, pagination: data.pagination! };
}

export async function updateVariantStock(variantId: string, stock: number): Promise<InventoryRow> {
  const { data } = await api.patch<ApiSuccess<InventoryRow>>(`/admin/inventory/variants/${variantId}`, { stock });
  return data.data;
}

export async function bulkUpdateStock(updates: { sku: string; stock: number }[]): Promise<BulkUpdateResult> {
  const { data } = await api.post<ApiSuccess<BulkUpdateResult>>('/admin/inventory/bulk', { updates });
  return data.data;
}
