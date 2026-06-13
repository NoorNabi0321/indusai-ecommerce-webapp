import type { Prisma, UserRole } from '@prisma/client';
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

/** Platform-wide audit log with filters (Owner-only). */
export async function listAuditLogs(opts: {
  actorId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const page = opts.page ?? 1;
  const limit = Math.min(opts.limit ?? 30, 100);
  const where: Prisma.AuditLogWhereInput = {};
  if (opts.actorId) where.actorId = opts.actorId;
  if (opts.action) where.action = opts.action;
  if (opts.from || opts.to) {
    where.createdAt = {};
    if (opts.from) where.createdAt.gte = opts.from;
    if (opts.to) where.createdAt.lte = opts.to;
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, action: true, target: true, targetId: true, ipAddress: true, createdAt: true, actorRole: true,
        actor: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    items: logs.map((l) => ({
      id: l.id,
      action: l.action,
      target: l.target,
      targetId: l.targetId,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
      actorRole: l.actorRole,
      actorId: l.actor.id,
      actorName: l.actor.name,
    })),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

/** Distinct actors + actions for the audit-log filter dropdowns. */
export async function listAuditFilters() {
  const [actions, actorRows] = await Promise.all([
    prisma.auditLog.findMany({ distinct: ['action'], select: { action: true }, orderBy: { action: 'asc' } }),
    prisma.auditLog.findMany({ distinct: ['actorId'], select: { actor: { select: { id: true, name: true, role: true } } } }),
  ]);
  return {
    actions: actions.map((a) => a.action),
    actors: actorRows.map((r) => ({ id: r.actor.id, name: r.actor.name, role: r.actor.role })),
  };
}
