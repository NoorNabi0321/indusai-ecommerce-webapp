import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as configService from '../services/config.service';

// GET /api/owner/config
export const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await configService.getConfig();
  res.json({ success: true, data: config });
});

// PUT /api/owner/config
export const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await configService.updateConfig(
    { id: req.user!.id, role: req.user!.role, ip: req.ip },
    req.body,
  );
  res.json({ success: true, data: config, message: 'Settings saved.' });
});

// GET /api/config/public
export const getPublicConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await configService.getPublicConfig();
  res.json({ success: true, data: config });
});
