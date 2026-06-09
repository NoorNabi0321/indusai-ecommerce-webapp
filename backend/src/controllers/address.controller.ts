import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as addressService from '../services/address.service';

// GET /api/addresses
export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await addressService.listAddresses(req.user!.id);
  res.json({ success: true, data });
});

// POST /api/addresses
export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await addressService.createAddress(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});

// PATCH /api/addresses/:id
export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await addressService.updateAddress(req.user!.id, req.params.id, req.body);
  res.json({ success: true, data });
});

// PATCH /api/addresses/:id/default
export const setDefault = asyncHandler(async (req: Request, res: Response) => {
  const data = await addressService.setDefaultAddress(req.user!.id, req.params.id);
  res.json({ success: true, data });
});

// DELETE /api/addresses/:id
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await addressService.deleteAddress(req.user!.id, req.params.id);
  res.json({ success: true, message: 'Address removed.' });
});
