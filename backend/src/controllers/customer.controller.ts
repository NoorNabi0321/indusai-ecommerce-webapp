import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as customerService from '../services/customer.service';

// GET /api/admin/customers
export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const s = req.query.status as string | undefined;
  const status = s === 'active' || s === 'suspended' ? s : undefined;
  const search = (req.query.search as string | undefined)?.trim() || undefined;

  const { items, pagination } = await customerService.listCustomers({ search, status, page, limit });
  res.json({ success: true, data: items, pagination });
});

// GET /api/admin/customers/:id
export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerProfile(req.params.id);
  res.json({ success: true, data: customer });
});

// PATCH /api/admin/customers/:id/status
export const setCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.setCustomerStatus(
    { id: req.user!.id, role: req.user!.role, ip: req.ip },
    req.params.id,
    req.body.isActive,
  );
  res.json({
    success: true,
    data: customer,
    message: req.body.isActive ? 'Customer activated.' : 'Customer suspended.',
  });
});
