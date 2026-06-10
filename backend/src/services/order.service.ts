import crypto from 'node:crypto';
import { Prisma, type UserRole, type OrderStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { sendOrderConfirmationEmail } from '../utils/email';
import { notifyUser, notifyRole } from './notification.service';
import { logger } from '../utils/logger';
import type { CreateOrderInput } from '../validation/order.validation';

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
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

function mapOrder(order: OrderWithRelations) {
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
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    address: order.address,
    payment: order.payment
      ? { ...order.payment, amount: Number(order.payment.amount) }
      : null,
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

/** Fetch a single order (owner-scoped; admins/owners can view any). */
export async function getOrderById(userId: string, role: UserRole, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
  if (!order) throw AppError.notFound('Order not found.');
  const isStaff = role === 'ADMINISTRATOR' || role === 'OWNER';
  if (order.userId !== userId && !isStaff) throw AppError.forbidden('You cannot view this order.');
  return mapOrder(order);
}
