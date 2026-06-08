import { Router } from 'express';
import { env } from '../config/env';

export const healthRouter = Router();

/** GET /api/health — liveness probe used by Railway and smoke tests. */
healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'indusai-api',
      env: env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});
