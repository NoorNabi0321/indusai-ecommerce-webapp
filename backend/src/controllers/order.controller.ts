import type { Request, Response } from 'express';
import type { OrderStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import * as orderService from '../services/order.service';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

// POST /api/orders
export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  res.status(201).json({ success: true, data: order, message: 'Order placed.' });
});

// GET /api/orders
export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const statusParam = req.query.status as string | undefined;
  const status = statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const { items, pagination } = await orderService.listOrders(req.user!.id, { status, page, limit });
  res.json({ success: true, data: items, pagination });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.user!.id, req.user!.role, req.params.id);
  res.json({ success: true, data: order });
});
