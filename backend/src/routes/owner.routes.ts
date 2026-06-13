import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAdminSchema, setAdminStatusSchema } from '../validation/user-management.validation';
import { updateConfigSchema } from '../validation/config.validation';
import * as ctrl from '../controllers/admin-product.controller';
import * as financeCtrl from '../controllers/finance.controller';
import * as umsCtrl from '../controllers/user-management.controller';
import * as configCtrl from '../controllers/config.controller';
import * as auditCtrl from '../controllers/audit.controller';

export const ownerRouter = Router();

// All owner routes require an authenticated Owner.
ownerRouter.use(authenticate, requireRole('OWNER'));

// Financial dashboard + reporting (Owner-only)
ownerRouter.get('/dashboard', financeCtrl.ownerDashboard);
ownerRouter.get('/financials', financeCtrl.ownerFinancials);
ownerRouter.get('/analytics', financeCtrl.ownerAnalytics);

// Administrator management
ownerRouter.get('/admins', umsCtrl.listAdmins);
ownerRouter.post('/admins', validate({ body: createAdminSchema }), umsCtrl.createAdmin);
ownerRouter.patch('/admins/:id/status', validate({ body: setAdminStatusSchema }), umsCtrl.setAdminStatus);
ownerRouter.delete('/admins/:id', umsCtrl.deleteAdmin);

// Deletion approvals
ownerRouter.get('/deletions', umsCtrl.listDeletions);
ownerRouter.post('/products/:id/approve-delete', ctrl.approveDeletion);
ownerRouter.post('/products/:id/reject-delete', ctrl.rejectDeletion);

// System configuration
ownerRouter.get('/config', configCtrl.getConfig);
ownerRouter.put('/config', validate({ body: updateConfigSchema }), configCtrl.updateConfig);

// Audit log
ownerRouter.get('/audit', auditCtrl.getAuditLogs);
ownerRouter.get('/audit/filters', auditCtrl.getAuditFilters);
