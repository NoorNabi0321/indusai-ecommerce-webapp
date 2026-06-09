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
