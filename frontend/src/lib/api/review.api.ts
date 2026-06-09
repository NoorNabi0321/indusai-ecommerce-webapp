import { api } from '@/lib/axios';
import type { ApiSuccess, Pagination } from '@/types/api.types';
import type { ReviewStats } from '@/types/product.types';

export interface ReviewDTO {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  user: { name: string; avatar: string | null } | null;
}

export interface ReviewsResponse {
  reviews: ReviewDTO[];
  stats: ReviewStats;
  pagination: Pagination;
}

export async function getReviews(
  productId: string,
  params: { page?: number; limit?: number; star?: number } = {},
): Promise<ReviewsResponse> {
  const { data } = await api.get<ApiSuccess<{ reviews: ReviewDTO[]; stats: ReviewStats }>>(
    `/products/${productId}/reviews`,
    { params },
  );
  return { reviews: data.data.reviews, stats: data.data.stats, pagination: data.pagination! };
}

export async function createReview(
  productId: string,
  payload: { rating: number; title?: string; body: string },
): Promise<ReviewDTO> {
  const { data } = await api.post<ApiSuccess<ReviewDTO>>(`/products/${productId}/reviews`, payload);
  return data.data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}
