import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as ctrl from '../controllers/admin-product.controller';
import * as financeCtrl from '../controllers/finance.controller';

export const ownerRouter = Router();

// All owner routes require an authenticated Owner.
ownerRouter.use(authenticate, requireRole('OWNER'));

// Financial dashboard + reporting (Owner-only)
ownerRouter.get('/dashboard', financeCtrl.ownerDashboard);
ownerRouter.get('/financials', financeCtrl.ownerFinancials);
ownerRouter.get('/analytics', financeCtrl.ownerAnalytics);

ownerRouter.post('/products/:id/approve-delete', ctrl.approveDeletion);
ownerRouter.post('/products/:id/reject-delete', ctrl.rejectDeletion);
