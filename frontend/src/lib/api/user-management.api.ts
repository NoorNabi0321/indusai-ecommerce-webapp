import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface AdminRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  productCount: number;
}

export interface DeletionRequestRow {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
  reviewedAt: string | null;
  requestedBy: string;
  reviewedBy: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    category: string;
    image: string | null;
    orderCount: number;
  };
}

export async function listAdmins(params: { search?: string; status?: string } = {}): Promise<AdminRow[]> {
  const { data } = await api.get<ApiSuccess<AdminRow[]>>('/owner/admins', { params });
  return data.data;
}

export async function createAdmin(payload: { name: string; email: string; phone?: string }): Promise<{ admin: AdminRow; tempPassword: string }> {
  const { data } = await api.post<ApiSuccess<{ admin: AdminRow; tempPassword: string }>>('/owner/admins', payload);
  return data.data;
}

export async function setAdminStatus(id: string, isActive: boolean): Promise<AdminRow> {
  const { data } = await api.patch<ApiSuccess<AdminRow>>(`/owner/admins/${id}/status`, { isActive });
  return data.data;
}

export async function deleteAdmin(id: string): Promise<void> {
  await api.delete(`/owner/admins/${id}`);
}

export async function listDeletions(status: 'pending' | 'all' = 'pending'): Promise<DeletionRequestRow[]> {
  const { data } = await api.get<ApiSuccess<DeletionRequestRow[]>>('/owner/deletions', { params: { status } });
  return data.data;
}

export async function approveDeletion(productId: string): Promise<void> {
  await api.post(`/owner/products/${productId}/approve-delete`);
}

export async function rejectDeletion(productId: string): Promise<void> {
  await api.post(`/owner/products/${productId}/reject-delete`);
}
