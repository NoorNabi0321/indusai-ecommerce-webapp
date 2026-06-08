import { Router } from 'express';
import { healthRouter } from './health.routes';

/**
 * Root API router, mounted at `/api`. Feature routers are added here as their
 * phases land (auth, products, orders, …).
 */
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
