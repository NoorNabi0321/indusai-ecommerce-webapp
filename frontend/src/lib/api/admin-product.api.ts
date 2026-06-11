import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';
import type { Product, ProductImage } from '@/types/product.types';

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string | null;
  basePrice: number;
  comparePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sku: string;
  variantCount: number;
  totalStock: number;
  deletionStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export interface VariantPayload {
  id?: string;
  size?: string;
  color?: string;
  sku?: string;
  stock: number;
  price?: number;
}

export interface ProductPayload {
  name: string;
  description: string;
  categoryId: string;
  brand?: string;
  tags: string[];
  basePrice: number;
  comparePrice?: number;
  isFeatured: boolean;
  isActive: boolean;
  variants: VariantPayload[];
}

export async function adminListProducts(
  params: { search?: string; categoryId?: string; status?: string; page?: number; limit?: number } = {},
): Promise<{ items: AdminProductRow[]; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<AdminProductRow[]>>('/admin/products', { params });
  return { items: data.data, pagination: data.pagination! };
}

export async function getAdminProduct(id: string): Promise<Product> {
  const { data } = await api.get<ApiSuccess<Product>>(`/admin/products/${id}`);
  return data.data;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await api.post<ApiSuccess<Product>>('/admin/products', payload);
  return data.data;
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>): Promise<Product> {
  const { data } = await api.put<ApiSuccess<Product>>(`/admin/products/${id}`, payload);
  return data.data;
}

export async function toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
  const { data } = await api.patch<ApiSuccess<Product>>(`/admin/products/${id}/status`, { isActive });
  return data.data;
}

export async function uploadProductImages(id: string, files: File[]): Promise<ProductImage[]> {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  const { data } = await api.post<ApiSuccess<ProductImage[]>>(`/admin/products/${id}/images`, form);
  return data.data;
}

export async function deleteProductImage(id: string, imageId: string): Promise<void> {
  await api.delete(`/admin/products/${id}/images/${imageId}`);
}

export async function requestProductDeletion(id: string, reason: string): Promise<void> {
  await api.post(`/admin/products/${id}/request-delete`, { reason });
}
