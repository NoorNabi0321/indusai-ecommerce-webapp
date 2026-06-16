import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { logger } from './utils/logger';
import { AppError } from './utils/AppError';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { stripeWebhook } from './controllers/payment.controller';

/** Build and configure the Express application (no listening — see server.ts). */
export function createApp(): Application {
  const app = express();

  // Behind a proxy in production (Railway) — needed for correct client IPs / rate limiting.
  app.set('trust proxy', 1);

  // ── Security & parsing ──
  app.use(helmet());
  // FRONTEND_URL may be a comma-separated list (e.g. prod domain + custom domain).
  const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin / server-to-server (no Origin header) and any listed origin.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(compression());

  // Stripe webhook needs the raw body for signature verification — must be
  // registered BEFORE the JSON body parser.
  app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ── Request logging ──
  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  );

  // ── Global rate limit: 100 requests / 15 min / IP ──
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
      },
    }),
  );

  // ── Routes ──
  app.use('/api', apiRouter);

  // ── 404 + error handling (must be last) ──
  app.use((req, _res, next) => {
    next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
  });
  app.use(errorHandler);

  return app;
}
