import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as orderService from '../services/order.service';

// POST /api/orders
export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  res.status(201).json({ success: true, data: order, message: 'Order placed.' });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.user!.id, req.user!.role, req.params.id);
  res.json({ success: true, data: order });
});
