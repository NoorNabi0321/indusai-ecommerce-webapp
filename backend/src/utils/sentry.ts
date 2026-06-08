import * as Sentry from '@sentry/node';
import { env } from '../config/env';
import { logger } from './logger';

let enabled = false;

/** Initialise Sentry only when a DSN is configured (Phase 14). No-op otherwise. */
export function initSentry(): void {
  if (!env.SENTRY_DSN_BACKEND) {
    logger.debug('Sentry disabled (no SENTRY_DSN_BACKEND set).');
    return;
  }
  Sentry.init({
    dsn: env.SENTRY_DSN_BACKEND,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  enabled = true;
  logger.info('Sentry error monitoring initialised.');
}

/** Report an exception to Sentry when enabled. */
export function captureException(error: unknown): void {
  if (enabled) Sentry.captureException(error);
}
