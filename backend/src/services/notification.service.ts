import type { NotificationType, UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface NotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/** Create an in-app notification for a single user. */
export async function notifyUser(userId: string, data: NotificationInput): Promise<void> {
  try {
    await prisma.notification.create({ data: { userId, ...data } });
  } catch (error) {
    logger.error('Failed to create notification:', error);
  }
}

/** Create an in-app notification for every active user of a role. */
export async function notifyRole(role: UserRole, data: NotificationInput): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role, isActive: true },
      select: { id: true },
    });
    if (users.length === 0) return;
    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, ...data })),
    });
  } catch (error) {
    logger.error('Failed to create role notifications:', error);
  }
}
