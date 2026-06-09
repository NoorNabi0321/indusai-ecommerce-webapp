import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getCategories,
  getFeaturedProducts,
  getFlashDeals,
  getProducts,
  getProductBySlug,
} from '@/lib/api/product.api';
import type { ProductFilters } from '@/types/product.types';

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: Boolean(slug),
  });
}

const PAGE_SIZE = 12;

/** Paginated product list with "load more" support, keyed on the full filter set. */
export function useInfiniteProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: ['products', 'list', filters],
    queryFn: ({ pageParam }) => getProducts({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
}

export interface Facets {
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}

/** Derive available filter options from the full category/search result set. */
export function useProductFacets(base: { category?: string; search?: string }) {
  return useQuery<Facets>({
    queryKey: ['facets', base],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { items } = await getProducts({ ...base, limit: 100 });
      const uniq = (arr: (string | null | undefined)[]) =>
        [...new Set(arr.filter(Boolean) as string[])].sort();
      const prices = items.map((p) => p.basePrice);
      return {
        brands: uniq(items.map((p) => p.brand)),
        sizes: uniq(items.flatMap((p) => p.variants?.map((v) => v.size) ?? [])),
        colors: uniq(items.flatMap((p) => p.variants?.map((v) => v.color) ?? [])),
        minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
        maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 100000,
      };
    },
  });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 5 * 60_000 });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => getFeaturedProducts(limit),
  });
}

export function useFlashDeals(limit = 8) {
  return useQuery({
    queryKey: ['products', 'flash-deals', limit],
    queryFn: () => getFlashDeals(limit),
  });
}

export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: ['products', 'new-arrivals', limit],
    queryFn: () => getProducts({ sortBy: 'newest', limit }).then((r) => r.items),
  });
}
