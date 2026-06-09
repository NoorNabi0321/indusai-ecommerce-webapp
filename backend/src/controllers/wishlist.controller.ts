import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as wishlistService from '../services/wishlist.service';

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const data = await wishlistService.getWishlist(req.user!.id);
  res.json({ success: true, data });
});

// POST /api/wishlist/:productId
export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const data = await wishlistService.addToWishlist(req.user!.id, req.params.productId);
  res.status(201).json({ success: true, data });
});

// DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const data = await wishlistService.removeFromWishlist(req.user!.id, req.params.productId);
  res.json({ success: true, data });
});
