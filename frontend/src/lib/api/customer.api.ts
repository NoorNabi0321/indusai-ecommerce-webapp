import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface CustomerAddress {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
  paymentMethod: string | null;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  addresses: CustomerAddress[];
  orders: CustomerOrderSummary[];
  stats: { totalOrders: number; totalSpent: number };
}

export async function listCustomers(
  params: { search?: string; status?: string; page?: number; limit?: number } = {},
): Promise<{ items: CustomerRow[]; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<CustomerRow[]>>('/admin/customers', { params });
  return { items: data.data, pagination: data.pagination! };
}

export async function getCustomer(id: string): Promise<CustomerProfile> {
  const { data } = await api.get<ApiSuccess<CustomerProfile>>(`/admin/customers/${id}`);
  return data.data;
}

export async function setCustomerStatus(id: string, isActive: boolean): Promise<CustomerProfile> {
  const { data } = await api.patch<ApiSuccess<CustomerProfile>>(`/admin/customers/${id}/status`, { isActive });
  return data.data;
}
