import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';
import type { Pagination } from '@/types/api.types';
import type { Product, Category, ProductFilters } from '@/types/product.types';

export type CategoryWithCount = Category & { productCount: number };

/** Serialize filters → query params (arrays become comma-separated). */
function toParams(filters: ProductFilters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value == null || value === '') continue;
    params[key] = Array.isArray(value) ? value.join(',') : (value as string | number | boolean);
  }
  return params;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const { data } = await api.get<ApiSuccess<CategoryWithCount[]>>('/categories');
  return data.data;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<{ items: Product[]; pagination: Pagination }> {
  const { data } = await api.get<ApiSuccess<Product[]>>('/products', { params: toParams(filters) });
  return { items: data.data, pagination: data.pagination! };
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data } = await api.get<ApiSuccess<Product[]>>('/products/featured', { params: { limit } });
  return data.data;
}

export async function getFlashDeals(limit = 8): Promise<Product[]> {
  const { data } = await api.get<ApiSuccess<Product[]>>('/products/flash-deals', { params: { limit } });
  return data.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get<ApiSuccess<Product>>(`/products/${slug}`);
  return data.data;
}
