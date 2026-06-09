import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validation/account.validation';
import * as ctrl from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.patch('/me', validate({ body: updateProfileSchema }), ctrl.updateProfile);
userRouter.patch('/me/password', validate({ body: changePasswordSchema }), ctrl.changePassword);
userRouter.post('/me/avatar', upload.single('avatar'), ctrl.updateAvatar);
