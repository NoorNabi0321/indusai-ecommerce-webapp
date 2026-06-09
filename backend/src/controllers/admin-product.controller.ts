import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as adminProductService from '../services/admin-product.service';
import type { Actor } from '../services/admin-product.service';

function actorFrom(req: Request): Actor {
  return { id: req.user!.id, role: req.user!.role, ip: req.ip };
}

// POST /api/admin/products
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await adminProductService.createProduct(actorFrom(req), req.body);
  res.status(201).json({ success: true, data: product, message: 'Product created.' });
});

// PUT /api/admin/products/:id
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await adminProductService.updateProduct(actorFrom(req), req.params.id, req.body);
  res.json({ success: true, data: product, message: 'Product updated.' });
});

// PATCH /api/admin/products/:id/status
export const toggleStatus = asyncHandler(async (req: Request, res: Response) => {
  const product = await adminProductService.toggleStatus(actorFrom(req), req.params.id, req.body.isActive);
  res.json({ success: true, data: product });
});

// POST /api/admin/products/:id/images
export const addImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const images = await adminProductService.addImages(actorFrom(req), req.params.id, files);
  res.status(201).json({ success: true, data: images, message: 'Images uploaded.' });
});

// DELETE /api/admin/products/:id/images/:imageId
export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  await adminProductService.removeImage(actorFrom(req), req.params.id, req.params.imageId);
  res.json({ success: true, message: 'Image removed.' });
});

// POST /api/admin/products/:id/request-delete
export const requestDeletion = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminProductService.requestDeletion(actorFrom(req), req.params.id, req.body.reason);
  res.status(201).json({ success: true, data: result, message: 'Deletion requested.' });
});

// POST /api/owner/products/:id/approve-delete
export const approveDeletion = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminProductService.approveDeletion(actorFrom(req), req.params.id);
  res.json({ success: true, data: result, message: 'Product deletion approved.' });
});

// POST /api/owner/products/:id/reject-delete
export const rejectDeletion = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminProductService.rejectDeletion(actorFrom(req), req.params.id);
  res.json({ success: true, data: result, message: 'Deletion request rejected.' });
});
