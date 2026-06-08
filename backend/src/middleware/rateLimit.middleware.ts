import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isProd = env.NODE_ENV === 'production';

const limitResponse = (message: string) => ({
  success: false,
  error: { code: 'RATE_LIMITED', message },
});

/**
 * Auth endpoints limiter: 5 requests / 15 min / IP in production.
 * Relaxed in development so local testing isn't throttled.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitResponse('Too many attempts. Please try again in a few minutes.'),
});

/** Stricter limiter for the admin/owner login: 3 / 15 min / IP in production. */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 3 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitResponse('Too many login attempts. Please try again later.'),
});
