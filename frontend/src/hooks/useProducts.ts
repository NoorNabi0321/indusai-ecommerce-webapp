import { useQuery } from '@tanstack/react-query';
import {
  getCategories,
  getFeaturedProducts,
  getFlashDeals,
  getProducts,
} from '@/lib/api/product.api';

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
