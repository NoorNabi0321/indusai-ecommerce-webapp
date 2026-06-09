import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import type { CartItemInput, MergeItem } from '../validation/cart.validation';

const CART_INCLUDE = {
  product: { include: { images: { where: { isMain: true }, take: 1 } } },
  variant: true,
} satisfies Prisma.CartItemInclude;

type CartItemWithRelations = Prisma.CartItemGetPayload<{ include: typeof CART_INCLUDE }>;

function mapCartItem(item: CartItemWithRelations) {
  const unitPrice =
    item.variant?.price != null ? Number(item.variant.price) : Number(item.product.basePrice);
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice,
    lineTotal: unitPrice * item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      basePrice: Number(item.product.basePrice),
      image: item.product.images[0]?.url ?? null,
    },
    variant: item.variant
      ? {
          id: item.variant.id,
          size: item.variant.size,
          color: item.variant.color,
          stock: item.variant.stock,
          price: item.variant.price != null ? Number(item.variant.price) : null,
        }
      : null,
  };
}

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: CART_INCLUDE,
    orderBy: { updatedAt: 'desc' },
  });
  const mapped = items.map(mapCartItem);
  return {
    items: mapped,
    summary: {
      count: mapped.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: mapped.reduce((sum, i) => sum + i.lineTotal, 0),
    },
  };
}

/** Validate that the product/variant exist, are active, and have stock. Returns available stock. */
async function resolveStock(
  productId: string,
  variantId: string | null,
  quantity: number,
): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || !product.isActive) throw AppError.notFound('Product is not available.');

  let stock = Number.POSITIVE_INFINITY;
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) throw AppError.badRequest('Invalid product variant.');
    stock = variant.stock;
  } else if (product.variants.length > 0) {
    throw AppError.badRequest('Please select a variant.');
  }

  if (quantity > stock) {
    throw AppError.badRequest(stock === 0 ? 'Out of stock.' : `Only ${stock} left in stock.`);
  }
  return stock;
}

export async function setCartItem(userId: string, input: CartItemInput) {
  const variantId = input.variantId ?? null;

  // Quantity 0 removes the line.
  if (input.quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productId: input.productId, variantId } });
    return getCart(userId);
  }

  const stock = await resolveStock(input.productId, variantId, input.quantity);
  const qty = Math.min(input.quantity, stock === Number.POSITIVE_INFINITY ? input.quantity : stock);

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId: input.productId, variantId },
  });
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: qty } });
  } else {
    await prisma.cartItem.create({
      data: { userId, productId: input.productId, variantId, quantity: qty },
    });
  }
  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) throw AppError.notFound('Cart item not found.');
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCart(userId);
}

/** Merge a guest cart into the server cart (sums quantities, capped at stock). */
export async function mergeCart(userId: string, items: MergeItem[]) {
  for (const it of items) {
    const variantId = it.variantId ?? null;
    try {
      const stock = await resolveStock(it.productId, variantId, 1);
      const existing = await prisma.cartItem.findFirst({
        where: { userId, productId: it.productId, variantId },
      });
      const desired = (existing?.quantity ?? 0) + it.quantity;
      const qty = stock === Number.POSITIVE_INFINITY ? desired : Math.min(desired, stock);
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: qty } });
      } else {
        await prisma.cartItem.create({ data: { userId, productId: it.productId, variantId, quantity: qty } });
      }
    } catch {
      // Skip invalid / out-of-stock items silently during merge.
    }
  }
  return getCart(userId);
}
