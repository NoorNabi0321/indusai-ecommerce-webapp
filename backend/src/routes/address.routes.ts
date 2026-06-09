import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addressSchema, updateAddressSchema } from '../validation/account.validation';
import * as ctrl from '../controllers/address.controller';

export const addressRouter = Router();

addressRouter.use(authenticate);

addressRouter.get('/', ctrl.list);
addressRouter.post('/', validate({ body: addressSchema }), ctrl.create);
addressRouter.patch('/:id/default', ctrl.setDefault);
addressRouter.patch('/:id', validate({ body: updateAddressSchema }), ctrl.update);
addressRouter.delete('/:id', ctrl.remove);
