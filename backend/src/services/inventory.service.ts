import { Prisma, type UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { writeAuditLog } from './audit.service';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

/** Stock thresholds that define alert tiers. */
export const STOCK_THRESHOLDS = { critical: 2, low: 5, moderate: 10 } as const;
export type AlertLevel = 'critical' | 'low' | 'moderate' | 'healthy';

export function alertLevel(stock: number): AlertLevel {
  if (stock <= STOCK_THRESHOLDS.critical) return 'critical';
  if (stock <= STOCK_THRESHOLDS.low) return 'low';
  if (stock <= STOCK_THRESHOLDS.moderate) return 'moderate';
  return 'healthy';
}

interface VariantRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  price: number | null;
  isActive: boolean;
  level: AlertLevel;
}

const VARIANT_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      images: { where: { isMain: true }, take: 1, select: { url: true } },
    },
  },
} satisfies Prisma.ProductVariantInclude;

function mapVariant(v: Prisma.ProductVariantGetPayload<{ include: typeof VARIANT_INCLUDE }>): VariantRow {
  return {
    variantId: v.id,
    productId: v.productId,
    productName: v.product.name,
    productSlug: v.product.slug,
    image: v.product.images[0]?.url ?? null,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
    price: v.price != null ? Number(v.price) : null,
    isActive: v.product.isActive,
    level: alertLevel(v.stock),
  };
}

/**
 * List variants for the inventory dashboard. By default only variants needing
 * attention (stock <= moderate threshold) are returned; `level` narrows further,
 * and `includeHealthy` returns the full catalogue.
 */
export async function listInventory(opts: {
  search?: string;
  level?: AlertLevel;
  includeHealthy?: boolean;
  page?: number;
  limit?: number;
}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 50;

  const where: Prisma.ProductVariantWhereInput = {};

  // Stock range by requested level (or alert-only by default).
  if (opts.level === 'critical') where.stock = { lte: STOCK_THRESHOLDS.critical };
  else if (opts.level === 'low') where.stock = { gt: STOCK_THRESHOLDS.critical, lte: STOCK_THRESHOLDS.low };
  else if (opts.level === 'moderate') where.stock = { gt: STOCK_THRESHOLDS.low, lte: STOCK_THRESHOLDS.moderate };
  else if (!opts.includeHealthy) where.stock = { lte: STOCK_THRESHOLDS.moderate };

  if (opts.search) {
    where.OR = [
      { sku: { contains: opts.search, mode: 'insensitive' } },
      { product: { name: { contains: opts.search, mode: 'insensitive' } } },
    ];
  }

  // Counts for the summary strip (independent of search/level filters but
  // honouring the search term so the numbers match the visible set).
  const summaryWhere: Prisma.ProductVariantWhereInput = opts.search
    ? { OR: where.OR }
    : {};

  const [total, variants, critical, low, moderate] = await Promise.all([
    prisma.productVariant.count({ where }),
    prisma.productVariant.findMany({
      where,
      include: VARIANT_INCLUDE,
      orderBy: { stock: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productVariant.count({ where: { ...summaryWhere, stock: { lte: STOCK_THRESHOLDS.critical } } }),
    prisma.productVariant.count({ where: { ...summaryWhere, stock: { gt: STOCK_THRESHOLDS.critical, lte: STOCK_THRESHOLDS.low } } }),
    prisma.productVariant.count({ where: { ...summaryWhere, stock: { gt: STOCK_THRESHOLDS.low, lte: STOCK_THRESHOLDS.moderate } } }),
  ]);

  return {
    items: variants.map(mapVariant),
    summary: { critical, low, moderate, alerts: critical + low + moderate },
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

/** Set a single variant's stock to an absolute value (inline quick-edit). */
export async function updateVariantStock(actor: Actor, variantId: string, stock: number): Promise<VariantRow> {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { id: true, stock: true } });
  if (!variant) throw AppError.notFound('Variant not found.');

  await prisma.productVariant.update({ where: { id: variantId }, data: { stock } });
  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'STOCK_UPDATE',
    target: 'ProductVariant',
    targetId: variantId,
    ipAddress: actor.ip,
  });

  const updated = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId }, include: VARIANT_INCLUDE });
  return mapVariant(updated);
}

interface BulkRow {
  sku: string;
  stock: number;
}

/** Batch-update stock by SKU (CSV import). Skips unknown SKUs, reports them. */
export async function bulkUpdateStock(actor: Actor, rows: BulkRow[]) {
  // Dedupe on SKU (last value wins) and resolve which exist.
  const bySku = new Map<string, number>();
  for (const r of rows) bySku.set(r.sku.trim(), r.stock);

  const skus = [...bySku.keys()];
  const existing = await prisma.productVariant.findMany({
    where: { sku: { in: skus } },
    select: { id: true, sku: true },
  });
  const existingSkus = new Set(existing.map((v) => v.sku));
  const notFound = skus.filter((s) => !existingSkus.has(s));

  await prisma.$transaction(
    existing.map((v) =>
      prisma.productVariant.update({ where: { id: v.id }, data: { stock: bySku.get(v.sku)! } }),
    ),
  );

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'STOCK_BULK_UPDATE',
    target: 'ProductVariant',
    targetId: `${existing.length} variants`,
    ipAddress: actor.ip,
  });

  return { updated: existing.length, notFound };
}
