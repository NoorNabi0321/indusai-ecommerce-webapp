import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

const WISHLIST_INCLUDE = {
  product: { include: { images: { where: { isMain: true }, take: 1 }, category: true } },
} satisfies Prisma.WishlistItemInclude;

type WishlistItemWithRelations = Prisma.WishlistItemGetPayload<{ include: typeof WISHLIST_INCLUDE }>;

function mapWishlistItem(item: WishlistItemWithRelations) {
  const p = item.product;
  return {
    id: item.id,
    productId: p.id,
    createdAt: item.createdAt,
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      basePrice: Number(p.basePrice),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
      image: p.images[0]?.url ?? null,
      category: p.category?.name ?? null,
      isActive: p.isActive,
    },
  };
}

export async function getWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: WISHLIST_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return items.map(mapWishlistItem);
}

/** Add a product to the wishlist (idempotent). */
export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true },
  });
  if (!product || !product.isActive) throw AppError.notFound('Product is not available.');

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });

  return getWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return getWishlist(userId);
}
