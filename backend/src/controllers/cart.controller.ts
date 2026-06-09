import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as cartService from '../services/cart.service';

// GET /api/cart
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.getCart(req.user!.id);
  res.json({ success: true, data });
});

// POST /api/cart
export const setCartItem = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.setCartItem(req.user!.id, req.body);
  res.json({ success: true, data });
});

// POST /api/cart/merge
export const mergeCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.mergeCart(req.user!.id, req.body.items);
  res.json({ success: true, data });
});

// DELETE /api/cart/:itemId
export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.removeCartItem(req.user!.id, req.params.itemId);
  res.json({ success: true, data });
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.clearCart(req.user!.id);
  res.json({ success: true, data, message: 'Cart cleared.' });
});
