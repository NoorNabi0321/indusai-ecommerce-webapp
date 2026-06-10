import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validation/order.validation';
import { placeOrder, getOrder } from '../controllers/order.controller';

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post('/', validate({ body: createOrderSchema }), placeOrder);
orderRouter.get('/:id', getOrder);
