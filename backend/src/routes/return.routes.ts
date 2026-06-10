import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { createReturnSchema } from '../validation/return.validation';
import { createReturn, listMyReturns } from '../controllers/return.controller';

export const returnRouter = Router();

returnRouter.use(authenticate);

returnRouter.get('/me', listMyReturns);
returnRouter.post('/', upload.array('photos', 5), validate({ body: createReturnSchema }), createReturn);
