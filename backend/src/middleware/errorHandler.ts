import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { captureException } from '../utils/sentry';
import { env } from '../config/env';

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

/**
 * Global error handler. Must be the last middleware registered.
 * Express identifies it as an error handler by its 4-argument arity, so `_next`
 * is required even though unused.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  // Never leak internals for unexpected (non-operational) errors in any env.
  const message = isAppError ? err.message : 'Something went wrong on our end';

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}`, err);
    captureException(err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode}: ${code}`);
  }

  const body: ErrorBody = {
    success: false,
    error: { code, message },
  };

  if (isAppError && err.details) {
    body.error.details = err.details;
  }
  if (env.NODE_ENV !== 'production' && !isAppError && err instanceof Error) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
