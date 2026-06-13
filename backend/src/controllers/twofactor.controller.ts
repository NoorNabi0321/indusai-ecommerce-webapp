import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as twoFactor from '../services/twofactor.service';

const actorOf = (req: Request) => ({ id: req.user!.id, role: req.user!.role, ip: req.ip });

// POST /api/users/me/2fa/setup
export const setup = asyncHandler(async (req: Request, res: Response) => {
  const data = await twoFactor.setup2FA(req.user!.id);
  res.json({ success: true, data });
});

// POST /api/users/me/2fa/enable
export const enable = asyncHandler(async (req: Request, res: Response) => {
  const data = await twoFactor.enable2FA(actorOf(req), req.body.token);
  res.json({ success: true, data, message: 'Two-factor authentication enabled.' });
});

// POST /api/users/me/2fa/disable
export const disable = asyncHandler(async (req: Request, res: Response) => {
  const data = await twoFactor.disable2FA(actorOf(req), req.body.token);
  res.json({ success: true, data, message: 'Two-factor authentication disabled.' });
});
