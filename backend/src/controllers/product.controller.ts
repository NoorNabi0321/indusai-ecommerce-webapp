import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { productQuerySchema } from '../validation/product.validation';
import * as productService from '../services/product.service';

function parseQuery(req: Request) {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw AppError.validation('Invalid query parameters', {
      fields: parsed.error.flatten().fieldErrors,
    });
  }
  return parsed.data;
}

// GET /api/products
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await productService.getProducts(parseQuery(req));
  res.json({ success: true, data: items, pagination });
});

// GET /api/products/featured
export const featuredProducts = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const data = await productService.getFeaturedProducts(limit);
  res.json({ success: true, data });
});

// GET /api/products/flash-deals
export const flashDeals = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const data = await productService.getFlashDeals(limit);
  res.json({ success: true, data });
});

// GET /api/products/:slug
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const data = await productService.getProductBySlug(req.params.slug);
  res.json({ success: true, data });
});

// Used by GET /api/categories/:slug/products
export const productsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const query = { ...parseQuery(req), category: req.params.slug };
  const { items, pagination } = await productService.getProducts(query);
  res.json({ success: true, data: items, pagination });
});
