import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validation/order.validation';
import { placeOrder, listOrders, getOrder } from '../controllers/order.controller';

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post('/', validate({ body: createOrderSchema }), placeOrder);
orderRouter.get('/', listOrders);
orderRouter.get('/:id', getOrder);
