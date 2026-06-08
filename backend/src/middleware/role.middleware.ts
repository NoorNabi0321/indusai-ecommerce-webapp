import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';

/**
 * Restrict a route to the given roles. Must run after `authenticate`.
 * OWNER implicitly satisfies ADMINISTRATOR-gated routes when included in `roles`.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('You do not have permission to access this resource.');
    }
    next();
  };
}
