import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Middleware factory that validates `req.body` / `req.query` / `req.params`
 * against Zod schemas. On failure responds 422 with field-level details.
 * Parsed (and coerced) values replace the originals.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          AppError.validation('Validation failed', {
            fields: error.flatten().fieldErrors,
          }),
        );
        return;
      }
      next(error);
    }
  };
}
