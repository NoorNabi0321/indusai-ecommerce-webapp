import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';

/**
 * Root API router, mounted at `/api`. Feature routers are added here as their
 * phases land (auth, products, orders, …).
 */
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
