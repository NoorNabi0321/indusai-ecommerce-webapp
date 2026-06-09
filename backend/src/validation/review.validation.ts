import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating is required').max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(3, 'Review is too short').max(2000),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  star: z.coerce.number().int().min(1).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
