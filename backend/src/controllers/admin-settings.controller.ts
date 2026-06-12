import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { listActorActivity } from '../services/audit.service';

// GET /api/admin/activity — the signed-in staff member's own recent activity.
export const getMyActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const logs = await listActorActivity(req.user!.id, limit);
  res.json({ success: true, data: logs });
});
