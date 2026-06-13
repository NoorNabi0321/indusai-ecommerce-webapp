import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { listAuditLogs, listAuditFilters } from '../services/audit.service';

// GET /api/owner/audit
export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 30;
  const actorId = (req.query.actorId as string | undefined)?.trim() || undefined;
  const action = (req.query.action as string | undefined)?.trim() || undefined;
  const fromRaw = req.query.from as string | undefined;
  const toRaw = req.query.to as string | undefined;
  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;
  if (to) to.setHours(23, 59, 59, 999);

  const { items, pagination } = await listAuditLogs({
    actorId, action,
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    page, limit,
  });
  res.json({ success: true, data: items, pagination });
});

// GET /api/owner/audit/filters
export const getAuditFilters = asyncHandler(async (_req: Request, res: Response) => {
  const filters = await listAuditFilters();
  res.json({ success: true, data: filters });
});
