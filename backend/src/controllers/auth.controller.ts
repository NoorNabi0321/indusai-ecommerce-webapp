import type { Request, Response, CookieOptions } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import * as authService from '../services/auth.service';

const REFRESH_COOKIE = 'indusai_rt';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function refreshCookieOptions(): CookieOptions {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_MAX_AGE,
    path: '/api/auth',
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
}

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerCustomer(req.body);
  res.status(201).json({
    success: true,
    data: user,
    message: 'Account created. Check your email for the verification code.',
  });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { userId, otp } = req.body;
  const user = await authService.verifyEmail(userId, otp);
  res.status(200).json({ success: true, data: user, message: 'Email verified. You can sign in now.' });
});

// POST /api/auth/resend-verification
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  await authService.resendVerification(req.body.userId);
  res.status(200).json({ success: true, message: 'If the account exists, a new code has been sent.' });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password, { ip: req.ip });
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) throw AppError.unauthorized('No active session.');

  const { user, accessToken, refreshToken } = await authService.refreshTokens(token);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) await authService.logout(token);
  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: 'Signed out.' });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: 'If an account exists for that email, a reset code has been sent.',
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  await authService.resetPassword(email, otp, password);
  res.status(200).json({ success: true, message: 'Password updated. Please sign in.' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  res.status(200).json({ success: true, data: user });
});
