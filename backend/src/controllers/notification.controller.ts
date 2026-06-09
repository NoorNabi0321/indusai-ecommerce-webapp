import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as notificationService from '../services/notification.service';

// GET /api/notifications
export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const { items, pagination } = await notificationService.listNotifications(req.user!.id, page, limit);
  res.json({ success: true, data: items, pagination });
});

// GET /api/notifications/unread-count
export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.unreadCount(req.user!.id);
  res.json({ success: true, data: { count } });
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markRead(req.user!.id, req.params.id);
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(req.user!.id);
  res.json({ success: true });
});
