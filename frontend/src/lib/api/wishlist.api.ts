import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';
import type { Product } from '@/types/product.types';

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'basePrice' | 'comparePrice'> & {
    image: string | null;
    category: string | null;
    isActive: boolean;
  };
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const { data } = await api.get<ApiSuccess<WishlistItem[]>>('/wishlist');
  return data.data;
}

export async function addToWishlist(productId: string): Promise<WishlistItem[]> {
  const { data } = await api.post<ApiSuccess<WishlistItem[]>>(`/wishlist/${productId}`);
  return data.data;
}

export async function removeFromWishlist(productId: string): Promise<WishlistItem[]> {
  const { data } = await api.delete<ApiSuccess<WishlistItem[]>>(`/wishlist/${productId}`);
  return data.data;
}
