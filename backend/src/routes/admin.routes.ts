import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  createProductSchema,
  updateProductSchema,
  toggleStatusSchema,
  requestDeleteSchema,
} from '../validation/admin-product.validation';
import { updateOrderStatusSchema } from '../validation/order.validation';
import * as ctrl from '../controllers/admin-product.controller';
import * as orderCtrl from '../controllers/admin-order.controller';
import { adminDashboard } from '../controllers/dashboard.controller';

export const adminRouter = Router();

// All admin routes require an authenticated Administrator or Owner.
adminRouter.use(authenticate, requireRole('ADMINISTRATOR', 'OWNER'));

// Dashboard
adminRouter.get('/dashboard', adminDashboard);

// Orders
adminRouter.get('/orders', orderCtrl.listAllOrders);
adminRouter.patch('/orders/:id/status', validate({ body: updateOrderStatusSchema }), orderCtrl.updateOrderStatus);

adminRouter.get('/products', ctrl.listProducts);
adminRouter.get('/products/:id', ctrl.getProduct);
adminRouter.post('/products', validate({ body: createProductSchema }), ctrl.createProduct);
adminRouter.put('/products/:id', validate({ body: updateProductSchema }), ctrl.updateProduct);
adminRouter.patch('/products/:id/status', validate({ body: toggleStatusSchema }), ctrl.toggleStatus);
adminRouter.post('/products/:id/images', upload.array('images', 5), ctrl.addImages);
adminRouter.delete('/products/:id/images/:imageId', ctrl.removeImage);
adminRouter.post(
  '/products/:id/request-delete',
  validate({ body: requestDeleteSchema }),
  ctrl.requestDeletion,
);
