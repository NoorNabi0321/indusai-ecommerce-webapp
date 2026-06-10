import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as returnService from '../services/return.service';

// POST /api/returns  (multipart: fields + optional `photos` files)
export const createReturn = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const result = await returnService.createReturn(req.user!.id, req.body, files);
  res.status(201).json({ success: true, data: result, message: 'Return request submitted.' });
});

// GET /api/returns/me
export const listMyReturns = asyncHandler(async (req: Request, res: Response) => {
  const data = await returnService.listMyReturns(req.user!.id);
  res.json({ success: true, data });
});
