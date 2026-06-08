/** Product domain types — mirror Prisma models (serialized as JSON). */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  price: number | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  isMain: boolean;
  order: number;
}

export interface ReviewStats {
  average: number;
  count: number;
  /** Count per star level, index 0 = 1★ … index 4 = 5★. */
  histogram: [number, number, number, number, number];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  brand: string | null;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  basePrice: number;
  comparePrice: number | null;
  createdAt: string;
  updatedAt: string;

  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  reviewStats?: ReviewStats;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  user?: { name: string; avatar: string | null };
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  brand?: string[];
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
