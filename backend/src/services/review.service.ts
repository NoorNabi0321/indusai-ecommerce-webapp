import type { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { getReviewStatsMap, emptyReviewStats } from './product.service';
import { writeAuditLog } from './audit.service';
import type { CreateReviewInput, ReviewQuery } from '../validation/review.validation';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

const REVIEW_USER_SELECT = { user: { select: { name: true, avatar: true } } };

/** Create a review — requires the user to have a DELIVERED order with the product. */
export async function createReview(
  userId: string,
  productId: string,
  data: CreateReviewInput,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true },
  });
  if (!product || !product.isActive) throw AppError.notFound('Product not found.');

  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, status: 'DELIVERED' } },
    select: { id: true },
  });
  if (!purchased) {
    throw AppError.forbidden('You can only review products you have purchased and received.');
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  if (existing) throw AppError.conflict('You have already reviewed this product.');

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating: data.rating,
      title: data.title ?? null,
      body: data.body,
    },
    include: REVIEW_USER_SELECT,
  });
}

/** Paginated reviews for a product, plus aggregate stats (over all reviews). */
export async function getReviews(productId: string, q: ReviewQuery) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw AppError.notFound('Product not found.');

  const where = { productId, ...(q.star ? { rating: q.star } : {}) };

  const [total, reviews, statsMap] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: REVIEW_USER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    getReviewStatsMap([productId]),
  ]);

  return {
    reviews,
    stats: statsMap.get(productId) ?? emptyReviewStats(),
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.limit)),
    },
  };
}

/** Delete a review. Authors can delete their own; admins/owners can moderate any. */
export async function deleteReview(actor: Actor, reviewId: string): Promise<void> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw AppError.notFound('Review not found.');

  const isAuthor = review.userId === actor.id;
  const isModerator = actor.role === 'ADMINISTRATOR' || actor.role === 'OWNER';

  if (!isAuthor && !isModerator) {
    throw AppError.forbidden('You can only delete your own review.');
  }

  await prisma.review.delete({ where: { id: reviewId } });

  // Audit only moderator actions on others' content.
  if (isModerator && !isAuthor) {
    await writeAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'REVIEW_MODERATE_DELETE',
      target: 'Review',
      targetId: reviewId,
      ipAddress: actor.ip,
    });
  }
}
