import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as ctrl from '../controllers/admin-product.controller';

export const ownerRouter = Router();

// All owner routes require an authenticated Owner.
ownerRouter.use(authenticate, requireRole('OWNER'));

ownerRouter.post('/products/:id/approve-delete', ctrl.approveDeletion);
ownerRouter.post('/products/:id/reject-delete', ctrl.rejectDeletion);
