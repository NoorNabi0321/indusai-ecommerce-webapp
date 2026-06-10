import crypto from 'node:crypto';
import { Prisma, type UserRole, type OrderStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { sendOrderConfirmationEmail } from '../utils/email';
import { notifyUser, notifyRole } from './notification.service';
import { writeAuditLog } from './audit.service';
import { logger } from '../utils/logger';
import type { CreateOrderInput } from '../validation/order.validation';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING = 200;
const EXPRESS_FEE = 500;

function shippingFor(subtotal: number, deliveryType: 'standard' | 'express'): number {
  if (deliveryType === 'express') return EXPRESS_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `IND-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { include: { images: { where: { isMain: true }, take: 1 } } },
      variant: true,
    },
  },
  address: true,
  payment: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

function mapOrder(order: OrderWithRelations, isAdmin = false) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    total: Number(order.total),
    notes: order.notes,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    address: order.address,
    payment: order.payment
      ? { ...order.payment, amount: Number(order.payment.amount) }
      : null,
    // Admin-only fields
    ...(isAdmin ? { internalNotes: order.internalNotes, customer: order.user } : {}),
    items: order.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
      price: Number(it.price),
      product: {
        id: it.product.id,
        name: it.product.name,
        slug: it.product.slug,
        image: it.product.images[0]?.url ?? null,
      },
      variant: it.variant ? { size: it.variant.size, color: it.variant.color } : null,
    })),
  };
}

/** Place an order from the user's cart (atomic: validate stock, deduct, clear cart). */
export async function createOrder(userId: string, input: CreateOrderInput) {
  const orderId = await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true, variant: true },
    });
    if (cartItems.length === 0) throw AppError.badRequest('Your cart is empty.');

    const address = await tx.address.findUnique({ where: { id: input.addressId } });
    if (!address || address.userId !== userId) {
      throw AppError.badRequest('Invalid delivery address.');
    }

    let subtotal = 0;
    const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of cartItems) {
      if (!item.product.isActive) {
        throw AppError.badRequest(`"${item.product.name}" is no longer available.`);
      }
      if (item.variantId) {
        if (!item.variant || item.variant.stock < item.quantity) {
          throw AppError.badRequest(`Insufficient stock for "${item.product.name}".`);
        }
      }
      const unitPrice =
        item.variant?.price != null ? Number(item.variant.price) : Number(item.product.basePrice);
      subtotal += unitPrice * item.quantity;
      itemsData.push({
        product: { connect: { id: item.productId } },
        ...(item.variantId ? { variant: { connect: { id: item.variantId } } } : {}),
        quantity: item.quantity,
        price: unitPrice,
      });
    }

    const shippingCost = shippingFor(subtotal, input.deliveryType);
    const total = subtotal + shippingCost;

    // Unique order number (retry on the rare collision).
    let orderNumber = genOrderNumber();
    while (await tx.order.findUnique({ where: { orderNumber }, select: { id: true } })) {
      orderNumber = genOrderNumber();
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        subtotal,
        shippingCost,
        discount: 0,
        total,
        addressId: input.addressId,
        notes: input.notes ?? null,
        items: { create: itemsData },
        payment: { create: { method: input.paymentMethod, status: 'PENDING', amount: total } },
      },
    });

    // Deduct variant stock.
    for (const item of cartItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Empty the cart.
    await tx.cartItem.deleteMany({ where: { userId } });

    return order.id;
  }, { maxWait: 10_000, timeout: 20_000 });

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: ORDER_INCLUDE });

  // Side effects (never fail the order).
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendOrderConfirmationEmail(
        user.email,
        user.name,
        order.orderNumber,
        `PKR ${Number(order.total).toLocaleString('en-PK')}`,
      );
      await notifyUser(userId, {
        type: 'ORDER_UPDATE',
        title: 'Order placed',
        message: `Your order ${order.orderNumber} has been received.`,
        link: `/account/orders/${order.id}`,
      });
    }
    await notifyRole('ADMINISTRATOR', {
      type: 'ORDER_UPDATE',
      title: 'New order',
      message: `Order ${order.orderNumber} was placed.`,
      link: '/admin/orders',
    });
  } catch (e) {
    logger.error('Order side-effects failed:', e);
  }

  return mapOrder(order);
}

/** Paginated order list for a customer (lightweight summaries). */
export async function listOrders(
  userId: string,
  opts: { status?: OrderStatus; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 10;
  const where: Prisma.OrderWhereInput = { userId, ...(opts.status ? { status: opts.status } : {}) };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { product: { include: { images: { where: { isMain: true }, take: 1 } } } } },
        payment: true,
      },
    }),
  ]);

  const items = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt,
    paymentMethod: o.payment?.method ?? null,
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    thumbnails: o.items
      .map((i) => i.product.images[0]?.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, 4),
  }));

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

/** Fetch a single order (owner-scoped; admins/owners can view any + internal fields). */
export async function getOrderById(userId: string, role: UserRole, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
  if (!order) throw AppError.notFound('Order not found.');
  const isStaff = role === 'ADMINISTRATOR' || role === 'OWNER';
  if (order.userId !== userId && !isStaff) throw AppError.forbidden('You cannot view this order.');
  return mapOrder(order, isStaff);
}

// ───────────────────────────── Admin: list ───────────────────────────────

export async function listAllOrders(opts: {
  status?: OrderStatus;
  paymentMethod?: 'STRIPE' | 'JAZZCASH' | 'EASYPAISA' | 'COD';
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const where: Prisma.OrderWhereInput = {};
  if (opts.status) where.status = opts.status;
  if (opts.paymentMethod) where.payment = { method: opts.paymentMethod };
  if (opts.search) {
    where.OR = [
      { orderNumber: { contains: opts.search, mode: 'insensitive' } },
      { user: { name: { contains: opts.search, mode: 'insensitive' } } },
      { user: { email: { contains: opts.search, mode: 'insensitive' } } },
    ];
  }

  const [total, orders, grouped] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        payment: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;

  const items = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt,
    customer: o.user,
    paymentMethod: o.payment?.method ?? null,
    paymentStatus: o.payment?.status ?? null,
    itemCount: o._count.items,
  }));

  return {
    items,
    counts,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

// ───────────────────────── Admin: update status ──────────────────────────

export async function updateOrderStatus(
  actor: Actor,
  orderId: string,
  status: OrderStatus,
  extra: { trackingNumber?: string; internalNotes?: string },
) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw AppError.notFound('Order not found.');

  const wasCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const restoreStock = (status === 'CANCELLED' || status === 'REFUNDED') && !wasCancelled;

  await prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(extra.trackingNumber !== undefined ? { trackingNumber: extra.trackingNumber } : {}),
          ...(extra.internalNotes !== undefined ? { internalNotes: extra.internalNotes } : {}),
        },
      });

      if (restoreStock) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      if (status === 'DELIVERED') {
        await tx.payment.updateMany({ where: { orderId }, data: { status: 'PAID' } });
      } else if (status === 'REFUNDED') {
        await tx.payment.updateMany({ where: { orderId }, data: { status: 'REFUNDED' } });
      }
    },
    { maxWait: 10_000, timeout: 20_000 },
  );

  await notifyUser(order.userId, {
    type: 'ORDER_UPDATE',
    title: `Order ${status.toLowerCase()}`,
    message: `Your order ${order.orderNumber} is now ${status.toLowerCase()}.`,
    link: `/account/orders/${orderId}`,
  });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'ORDER_STATUS_UPDATE',
    target: 'Order',
    targetId: orderId,
    ipAddress: actor.ip,
  });

  return getOrderById(actor.id, actor.role, orderId);
}
