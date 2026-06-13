import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validation/account.validation';
import { twoFactorTokenSchema } from '../validation/twofactor.validation';
import * as ctrl from '../controllers/user.controller';
import * as twoFactorCtrl from '../controllers/twofactor.controller';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.patch('/me', validate({ body: updateProfileSchema }), ctrl.updateProfile);
userRouter.patch('/me/password', validate({ body: changePasswordSchema }), ctrl.changePassword);
userRouter.post('/me/avatar', upload.single('avatar'), ctrl.updateAvatar);

// Two-factor authentication (TOTP)
userRouter.post('/me/2fa/setup', twoFactorCtrl.setup);
userRouter.post('/me/2fa/enable', validate({ body: twoFactorTokenSchema }), twoFactorCtrl.enable);
userRouter.post('/me/2fa/disable', validate({ body: twoFactorTokenSchema }), twoFactorCtrl.disable);
