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
import { userRouter } from './user.routes';
import { addressRouter } from './address.routes';
import { notificationRouter } from './notification.routes';
import { orderRouter } from './order.routes';
import { returnRouter } from './return.routes';
import { configRouter } from './config.routes';
import { paymentRouter } from './payment.routes';

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
apiRouter.use('/users', userRouter);
apiRouter.use('/addresses', addressRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/returns', returnRouter);
apiRouter.use('/config', configRouter);
apiRouter.use('/payments', paymentRouter);
