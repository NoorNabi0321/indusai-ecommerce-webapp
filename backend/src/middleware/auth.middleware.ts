import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Authenticate a request via a Bearer access token (Authorization header) or an
 * `accessToken` cookie. Attaches `req.user` on success; 401 otherwise.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = bearer ?? (req.cookies?.accessToken as string | undefined);

  if (!token) {
    throw AppError.unauthorized('Authentication required.');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token.');
  }
}
