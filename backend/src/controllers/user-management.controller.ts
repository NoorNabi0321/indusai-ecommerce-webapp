import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as ums from '../services/user-management.service';

const actorOf = (req: Request) => ({ id: req.user!.id, role: req.user!.role, ip: req.ip });

// GET /api/owner/admins
export const listAdmins = asyncHandler(async (req: Request, res: Response) => {
  const s = req.query.status as string | undefined;
  const status = s === 'active' || s === 'suspended' ? s : undefined;
  const search = (req.query.search as string | undefined)?.trim() || undefined;
  const admins = await ums.listAdmins({ search, status });
  res.json({ success: true, data: admins });
});

// POST /api/owner/admins
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { admin, tempPassword } = await ums.createAdmin(actorOf(req), req.body);
  res.status(201).json({
    success: true,
    data: { admin, tempPassword },
    message: 'Administrator created. The temporary password was emailed and is shown once below.',
  });
});

// PATCH /api/owner/admins/:id/status
export const setAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const admin = await ums.setAdminStatus(actorOf(req), req.params.id, req.body.isActive);
  res.json({ success: true, data: admin, message: req.body.isActive ? 'Administrator activated.' : 'Administrator suspended.' });
});

// DELETE /api/owner/admins/:id
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  await ums.deleteAdmin(actorOf(req), req.params.id);
  res.json({ success: true, data: { id: req.params.id }, message: 'Administrator deleted.' });
});

// GET /api/owner/deletions
export const listDeletions = asyncHandler(async (req: Request, res: Response) => {
  const s = req.query.status as string | undefined;
  const status = s === 'all' ? 'all' : 'pending';
  const requests = await ums.listDeletionRequests({ status });
  res.json({ success: true, data: requests });
});
