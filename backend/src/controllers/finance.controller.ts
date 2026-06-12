import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as financeService from '../services/finance.service';

// GET /api/owner/dashboard?days=7|30
export const ownerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const safeDays = [7, 30, 90].includes(days) ? days : 30;
  const data = await financeService.getOwnerDashboard(safeDays);
  res.json({ success: true, data });
});

// GET /api/owner/financials?from=ISO&to=ISO
export const ownerFinancials = asyncHandler(async (req: Request, res: Response) => {
  const fromRaw = req.query.from as string | undefined;
  const toRaw = req.query.to as string | undefined;
  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;
  const data = await financeService.getOwnerFinancials({
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
  });
  res.json({ success: true, data });
});
