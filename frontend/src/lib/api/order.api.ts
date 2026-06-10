import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';
import type { Address } from '@/types/user.types';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order.types';

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  paymentMethod: PaymentMethod | null;
  itemCount: number;
  thumbnails: string[];
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: { id: string; name: string; slug: string; image: string | null };
  variant: { size: string | null; color: string | null } | null;
}

export interface PaymentDTO {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  address: Address;
  payment: PaymentDTO | null;
  items: OrderItemDTO[];
}

export interface CreateOrderPayload {
  addressId: string;
  deliveryType: 'standard' | 'express';
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderDTO> {
  const { data } = await api.post<ApiSuccess<OrderDTO>>('/orders', payload);
  return data.data;
}

export async function getOrder(id: string): Promise<OrderDTO> {
  const { data } = await api.get<ApiSuccess<OrderDTO>>(`/orders/${id}`);
  return data.data;
}

export async function listOrders(
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<{ items: OrderSummary[]; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<OrderSummary[]>>('/orders', { params });
  return { items: data.data, pagination: data.pagination! };
}
