import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface CartLineDTO {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: { id: string; name: string; slug: string; basePrice: number; image: string | null };
  variant: { id: string; size: string | null; color: string | null; stock: number; price: number | null } | null;
}

export interface CartData {
  items: CartLineDTO[];
  summary: { count: number; subtotal: number };
}

export interface SetCartItemPayload {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface MergeItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function getCart(): Promise<CartData> {
  const { data } = await api.get<ApiSuccess<CartData>>('/cart');
  return data.data;
}

export async function setCartItem(payload: SetCartItemPayload): Promise<CartData> {
  const { data } = await api.post<ApiSuccess<CartData>>('/cart', payload);
  return data.data;
}

export async function mergeCart(items: MergeItem[]): Promise<CartData> {
  const { data } = await api.post<ApiSuccess<CartData>>('/cart/merge', { items });
  return data.data;
}

export async function removeCartItem(itemId: string): Promise<CartData> {
  const { data } = await api.delete<ApiSuccess<CartData>>(`/cart/${itemId}`);
  return data.data;
}

export async function clearCart(): Promise<CartData> {
  const { data } = await api.delete<ApiSuccess<CartData>>('/cart');
  return data.data;
}
