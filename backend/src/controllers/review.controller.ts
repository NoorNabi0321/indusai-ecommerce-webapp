import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { reviewQuerySchema } from '../validation/review.validation';
import * as reviewService from '../services/review.service';

// POST /api/products/:id/reviews  (authenticated)
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.user!.id, req.params.id, req.body);
  res.status(201).json({ success: true, data: review, message: 'Review posted.' });
});

// GET /api/products/:id/reviews  (public)
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const parsed = reviewQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw AppError.validation('Invalid query parameters', {
      fields: parsed.error.flatten().fieldErrors,
    });
  }
  const { reviews, stats, pagination } = await reviewService.getReviews(req.params.id, parsed.data);
  res.json({ success: true, data: { reviews, stats }, pagination });
});

// DELETE /api/reviews/:id  (author or moderator)
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.deleteReview(
    { id: req.user!.id, role: req.user!.role, ip: req.ip },
    req.params.id,
  );
  res.json({ success: true, message: 'Review deleted.' });
});
