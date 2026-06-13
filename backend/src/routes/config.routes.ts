import { Router } from 'express';
import * as configCtrl from '../controllers/config.controller';

export const configRouter = Router();

// Public storefront config (maintenance banner + enabled payment methods).
configRouter.get('/public', configCtrl.getPublicConfig);
