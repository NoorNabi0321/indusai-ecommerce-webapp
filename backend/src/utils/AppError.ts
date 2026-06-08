/**
 * Operational error with an HTTP status code and a machine-readable error code.
 * Thrown by services/controllers and formatted by the global error handler.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  // ── Common factory helpers ──
  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }
  static forbidden(message = 'You do not have permission to perform this action'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }
  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }
  static conflict(message: string): AppError {
    return new AppError(message, 409, 'CONFLICT');
  }
  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }
}
