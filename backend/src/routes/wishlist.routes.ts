import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/wishlist.controller';

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get('/', ctrl.getWishlist);
wishlistRouter.post('/:productId', ctrl.addToWishlist);
wishlistRouter.delete('/:productId', ctrl.removeFromWishlist);
