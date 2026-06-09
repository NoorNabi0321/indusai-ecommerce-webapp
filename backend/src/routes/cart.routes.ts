import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { cartItemSchema, mergeCartSchema } from '../validation/cart.validation';
import * as ctrl from '../controllers/cart.controller';

export const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get('/', ctrl.getCart);
cartRouter.post('/', validate({ body: cartItemSchema }), ctrl.setCartItem);
cartRouter.post('/merge', validate({ body: mergeCartSchema }), ctrl.mergeCart);
cartRouter.delete('/', ctrl.clearCart);
cartRouter.delete('/:itemId', ctrl.removeCartItem);
