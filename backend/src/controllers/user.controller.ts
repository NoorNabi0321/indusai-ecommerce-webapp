import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as userService from '../services/user.service';

// PATCH /api/users/me
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  res.json({ success: true, data: user, message: 'Profile updated.' });
});

// PATCH /api/users/me/password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, message: 'Password updated.' });
});

// POST /api/users/me/avatar
export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw AppError.badRequest('No image provided.');
  const user = await userService.updateAvatar(req.user!.id, req.file);
  res.json({ success: true, data: user, message: 'Avatar updated.' });
});
