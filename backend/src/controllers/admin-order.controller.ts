import type { Request, Response } from 'express';
import type { OrderStatus, PaymentMethod } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import * as orderService from '../services/order.service';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const PAYMENT_METHODS: PaymentMethod[] = ['STRIPE', 'JAZZCASH', 'EASYPAISA', 'COD'];

// GET /api/admin/orders
export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const s = req.query.status as string | undefined;
  const m = req.query.paymentMethod as string | undefined;
  const status = s && ORDER_STATUSES.includes(s as OrderStatus) ? (s as OrderStatus) : undefined;
  const paymentMethod = m && PAYMENT_METHODS.includes(m as PaymentMethod) ? (m as PaymentMethod) : undefined;
  const search = (req.query.search as string | undefined)?.trim() || undefined;

  const { items, counts, pagination } = await orderService.listAllOrders({ status, paymentMethod, search, page, limit });
  res.json({ success: true, data: items, pagination, meta: { counts } });
});

// PATCH /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, trackingNumber, internalNotes } = req.body;
  const order = await orderService.updateOrderStatus(
    { id: req.user!.id, role: req.user!.role, ip: req.ip },
    req.params.id,
    status,
    { trackingNumber, internalNotes },
  );
  res.json({ success: true, data: order, message: 'Order updated.' });
});
