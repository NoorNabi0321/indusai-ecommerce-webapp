import type { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuditEntry {
  actorId: string;
  actorRole: UserRole;
  action: string;
  target?: string;
  targetId?: string;
  ipAddress?: string;
}

/** Record a significant action in the audit log (Owner-visible). Never throws. */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (error) {
    // Auditing must never break the operation it records.
    logger.error('Failed to write audit log:', error);
  }
}

/** Recent activity for a single actor (their own settings/activity view). */
export async function listActorActivity(actorId: string, limit = 20) {
  const logs = await prisma.auditLog.findMany({
    where: { actorId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 100),
    select: { id: true, action: true, target: true, targetId: true, ipAddress: true, createdAt: true },
  });
  return logs;
}
