import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { productRouter } from './product.routes';
import { categoryRouter } from './category.routes';
import { adminRouter } from './admin.routes';
import { ownerRouter } from './owner.routes';
import { reviewRouter } from './review.routes';
import { cartRouter } from './cart.routes';
import { wishlistRouter } from './wishlist.routes';

/**
 * Root API router, mounted at `/api`. Feature routers are added here as their
 * phases land (auth, products, orders, …).
 */
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/owner', ownerRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/wishlist', wishlistRouter);
