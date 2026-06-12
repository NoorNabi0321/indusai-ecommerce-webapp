import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as inventoryService from '../services/inventory.service';
import type { AlertLevel } from '../services/inventory.service';

const LEVELS: AlertLevel[] = ['critical', 'low', 'moderate', 'healthy'];

// GET /api/admin/inventory
export const listInventory = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const l = req.query.level as string | undefined;
  const level = l && LEVELS.includes(l as AlertLevel) ? (l as AlertLevel) : undefined;
  const includeHealthy = req.query.includeHealthy === 'true';
  const search = (req.query.search as string | undefined)?.trim() || undefined;

  const { items, summary, pagination } = await inventoryService.listInventory({
    search, level, includeHealthy, page, limit,
  });
  res.json({ success: true, data: items, pagination, meta: { summary } });
});

// PATCH /api/admin/inventory/variants/:id
export const updateVariantStock = asyncHandler(async (req: Request, res: Response) => {
  const variant = await inventoryService.updateVariantStock(
    { id: req.user!.id, role: req.user!.role, ip: req.ip },
    req.params.id,
    req.body.stock,
  );
  res.json({ success: true, data: variant, message: 'Stock updated.' });
});

// POST /api/admin/inventory/bulk
export const bulkUpdateStock = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.bulkUpdateStock(
    { id: req.user!.id, role: req.user!.role, ip: req.ip },
    req.body.updates,
  );
  res.json({
    success: true,
    data: result,
    message: `Updated ${result.updated} variant(s).${result.notFound.length ? ` ${result.notFound.length} SKU(s) not found.` : ''}`,
  });
});
