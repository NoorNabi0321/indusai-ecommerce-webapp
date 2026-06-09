import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import type { ProductQuery } from '../validation/product.validation';

// ───────────────────────────── Serializers ──────────────────────────────
// Prisma returns Decimal objects; convert to numbers for the JSON API.

function toNum(value: Prisma.Decimal | null): number | null {
  return value == null ? null : Number(value);
}

export interface ReviewStats {
  average: number;
  count: number;
  histogram: [number, number, number, number, number];
}

function emptyStats(): ReviewStats {
  return { average: 0, count: 0, histogram: [0, 0, 0, 0, 0] };
}

/** Compute review stats (avg, count, per-star histogram) for many products at once. */
async function getReviewStatsMap(productIds: string[]): Promise<Map<string, ReviewStats>> {
  const map = new Map<string, ReviewStats>();
  if (productIds.length === 0) return map;

  const grouped = await prisma.review.groupBy({
    by: ['productId', 'rating'],
    where: { productId: { in: productIds } },
    _count: { _all: true },
  });

  for (const row of grouped) {
    const stats = map.get(row.productId) ?? emptyStats();
    const star = row.rating;
    if (star >= 1 && star <= 5) {
      stats.histogram[star - 1] = row._count._all;
    }
    map.set(row.productId, stats);
  }

  for (const stats of map.values()) {
    const count = stats.histogram.reduce((a, b) => a + b, 0);
    const weighted = stats.histogram.reduce((sum, n, i) => sum + n * (i + 1), 0);
    stats.count = count;
    stats.average = count ? Math.round((weighted / count) * 10) / 10 : 0;
  }

  return map;
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; variants: true; images: true };
}>;

export function mapProduct(p: ProductWithRelations, stats?: ReviewStats) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryId: p.categoryId,
    brand: p.brand,
    tags: p.tags,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    basePrice: Number(p.basePrice),
    comparePrice: toNum(p.comparePrice),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    category: p.category,
    images: p.images,
    variants: p.variants.map((v) => ({ ...v, price: toNum(v.price) })),
    reviewStats: stats ?? emptyStats(),
  };
}

export const PRODUCT_INCLUDE = {
  category: true,
  variants: true,
  images: { orderBy: { order: 'asc' } },
} satisfies Prisma.ProductInclude;

// ──────────────────────────── List products ─────────────────────────────

export async function getProducts(q: ProductQuery) {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (q.category) where.category = { slug: q.category };

  if (q.minPrice != null || q.maxPrice != null) {
    where.basePrice = {
      ...(q.minPrice != null ? { gte: q.minPrice } : {}),
      ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
    };
  }

  if (q.brand?.length) where.brand = { in: q.brand };

  const variantConds: Prisma.ProductVariantWhereInput = {};
  if (q.size?.length) variantConds.size = { in: q.size };
  if (q.color?.length) variantConds.color = { in: q.color };
  if (q.inStock) variantConds.stock = { gt: 0 };
  if (Object.keys(variantConds).length) where.variants = { some: variantConds };

  if (q.search) {
    where.OR = [
      { name: { contains: q.search, mode: 'insensitive' } },
      { description: { contains: q.search, mode: 'insensitive' } },
      { brand: { contains: q.search, mode: 'insensitive' } },
      { tags: { has: q.search.toLowerCase() } },
    ];
  }

  // Rating filter: keep only products whose average rating meets the threshold.
  if (q.rating) {
    const candidates = await prisma.product.findMany({ where, select: { id: true } });
    const avgs = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: candidates.map((c) => c.id) } },
      _avg: { rating: true },
    });
    const qualifying = avgs
      .filter((a) => (a._avg.rating ?? 0) >= q.rating!)
      .map((a) => a.productId);
    where.id = { in: qualifying };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] =
    q.sortBy === 'price-asc'
      ? { basePrice: 'asc' }
      : q.sortBy === 'price-desc'
        ? { basePrice: 'desc' }
        : q.sortBy === 'newest'
          ? { createdAt: 'desc' }
          : [{ isFeatured: 'desc' }, { createdAt: 'desc' }];

  const skip = (q.page - 1) * q.limit;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip, take: q.limit, include: PRODUCT_INCLUDE }),
  ]);

  const stats = await getReviewStatsMap(products.map((p) => p.id));
  let items = products.map((p) => mapProduct(p, stats.get(p.id)));

  // "rating" sort can't be expressed in SQL here — sort the page by average.
  if (q.sortBy === 'rating') {
    items = items.sort((a, b) => b.reviewStats.average - a.reviewStats.average);
  }

  return {
    items,
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.limit)),
    },
  };
}

// ───────────────────────────── Single product ───────────────────────────

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      ...PRODUCT_INCLUDE,
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!product || !product.isActive) {
    throw AppError.notFound('Product not found.');
  }

  const stats = (await getReviewStatsMap([product.id])).get(product.id) ?? emptyStats();

  return {
    ...mapProduct(product, stats),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      productId: r.productId,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      user: r.user,
    })),
  };
}

// ─────────────────────────── Featured / deals ───────────────────────────

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: PRODUCT_INCLUDE,
  });
  const stats = await getReviewStatsMap(products.map((p) => p.id));
  return products.map((p) => mapProduct(p, stats.get(p.id)));
}

export async function getFlashDeals(limit = 8) {
  // Products with a compare-at price greater than the current price.
  const products = await prisma.product.findMany({
    where: { isActive: true, comparePrice: { not: null } },
    orderBy: { createdAt: 'desc' },
    include: PRODUCT_INCLUDE,
  });
  const onSale = products.filter(
    (p) => p.comparePrice != null && Number(p.comparePrice) > Number(p.basePrice),
  );
  const stats = await getReviewStatsMap(onSale.map((p) => p.id));
  return onSale.slice(0, limit).map((p) => mapProduct(p, stats.get(p.id)));
}

// ───────────────────────────── Categories ───────────────────────────────

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    productCount: c._count.products,
  }));
}
