import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as productService from '../services/product.service';

// GET /api/categories
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const data = await productService.getCategories();
  res.json({ success: true, data });
});
