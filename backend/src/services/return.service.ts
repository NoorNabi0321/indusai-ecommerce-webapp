import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { uploadImageBuffer, isCloudinaryConfigured } from '../config/cloudinary';
import { notifyRole, notifyUser } from './notification.service';
import type { CreateReturnInput } from '../validation/return.validation';

const RETURN_WINDOW_DAYS = 7;

export async function createReturn(
  userId: string,
  input: CreateReturnInput,
  photoFiles: Express.Multer.File[],
) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });
  if (!order || order.userId !== userId) throw AppError.notFound('Order not found.');
  if (order.status !== 'DELIVERED') {
    throw AppError.badRequest('Only delivered orders can be returned.');
  }

  // Within the return window.
  const days = (Date.now() - order.createdAt.getTime()) / 86_400_000;
  if (days > RETURN_WINDOW_DAYS) {
    throw AppError.badRequest(`Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery.`);
  }

  // No active return already.
  const existing = await prisma.returnRequest.findFirst({
    where: { orderId: input.orderId, status: { in: ['PENDING', 'APPROVED'] } },
    select: { id: true },
  });
  if (existing) throw AppError.conflict('A return request for this order is already in progress.');

  // Validate items belong to the order and quantities are valid.
  for (const item of input.items) {
    const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
    if (!orderItem) throw AppError.badRequest('One of the items is not part of this order.');
    if (item.quantity > orderItem.quantity) {
      throw AppError.badRequest('Return quantity exceeds the ordered quantity.');
    }
  }

  // Upload any photos.
  const photoUrls: string[] = [];
  if (isCloudinaryConfigured && photoFiles.length > 0) {
    for (const file of photoFiles) {
      const uploaded = await uploadImageBuffer(file.buffer, 'indusai/returns');
      photoUrls.push(uploaded.url);
    }
  }

  const created = await prisma.returnRequest.create({
    data: {
      orderId: input.orderId,
      userId,
      reason: input.reason,
      description: input.description ?? null,
      refundMethod: input.refundMethod,
      photos: photoUrls,
      items: { create: input.items.map((i) => ({ orderItemId: i.orderItemId, quantity: i.quantity })) },
    },
  });

  // Notify staff (admins handle returns; owner oversees).
  await Promise.all([
    notifyRole('ADMINISTRATOR', {
      type: 'ORDER_UPDATE',
      title: 'Return requested',
      message: `A return was requested for order ${order.orderNumber}.`,
      link: '/admin/orders',
    }),
    notifyRole('OWNER', {
      type: 'ORDER_UPDATE',
      title: 'Return requested',
      message: `A return was requested for order ${order.orderNumber}.`,
      link: '/admin/orders',
    }),
  ]);
  await notifyUser(userId, {
    type: 'ORDER_UPDATE',
    title: 'Return request received',
    message: `We've received your return request for order ${order.orderNumber}.`,
    link: '/account/orders',
  });

  return { id: created.id, status: created.status, orderNumber: order.orderNumber };
}

/** A customer's return requests with order + item summaries. */
export async function listMyReturns(userId: string) {
  const returns = await prisma.returnRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      order: { select: { orderNumber: true } },
      items: { include: { orderItem: { include: { product: { select: { name: true } } } } } },
    },
  });
  return returns.map((r) => ({
    id: r.id,
    status: r.status,
    reason: r.reason,
    refundMethod: r.refundMethod,
    createdAt: r.createdAt,
    orderNumber: r.order.orderNumber,
    items: r.items.map((it) => ({ name: it.orderItem.product.name, quantity: it.quantity })),
  }));
}
