import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/notification.controller';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', ctrl.list);
notificationRouter.get('/unread-count', ctrl.unreadCount);
notificationRouter.patch('/read-all', ctrl.markAllRead);
notificationRouter.patch('/:id/read', ctrl.markRead);
