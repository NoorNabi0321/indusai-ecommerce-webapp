import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getAdminDashboard } from '../services/dashboard.service';

// GET /api/admin/dashboard?days=7
export const adminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days === '30' ? 30 : 7;
  const data = await getAdminDashboard(req.user!.role, days);
  res.json({ success: true, data });
});
