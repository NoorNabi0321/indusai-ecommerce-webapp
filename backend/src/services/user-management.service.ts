import crypto from 'node:crypto';
import { Prisma, type UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/hash';
import { sendAdminWelcomeEmail } from '../utils/email';
import { writeAuditLog } from './audit.service';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

/** Generates a strong, readable temporary password (e.g. "Indus-7F3A-92kd"). */
function generateTempPassword(): string {
  const block = () => crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
  const tail = crypto.randomBytes(4).toString('base64url').replace(/[^a-z0-9]/gi, '').slice(0, 4);
  return `Indus-${block()}-${tail}9`;
}

const ADMIN_SELECT = {
  id: true, name: true, email: true, phone: true, avatar: true,
  isActive: true, isVerified: true, createdAt: true,
  _count: { select: { products: true } },
} satisfies Prisma.UserSelect;

function mapAdmin(u: Prisma.UserGetPayload<{ select: typeof ADMIN_SELECT }>) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    isActive: u.isActive,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    productCount: u._count.products,
  };
}

export async function listAdmins(opts: { search?: string; status?: 'active' | 'suspended' }) {
  const where: Prisma.UserWhereInput = { role: 'ADMINISTRATOR' };
  if (opts.status === 'active') where.isActive = true;
  else if (opts.status === 'suspended') where.isActive = false;
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { email: { contains: opts.search, mode: 'insensitive' } },
    ];
  }

  const admins = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, select: ADMIN_SELECT });
  return admins.map(mapAdmin);
}

/**
 * Creates an administrator with a generated temporary password. The password is
 * emailed (best-effort) AND returned once so the Owner can hand it over directly
 * — email delivery is restricted in the dev sandbox.
 */
export async function createAdmin(actor: Actor, input: { name: string; email: string; phone?: string }) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw AppError.conflict('A user with this email already exists.');
  if (input.phone) {
    const phoneTaken = await prisma.user.findUnique({ where: { phone: input.phone }, select: { id: true } });
    if (phoneTaken) throw AppError.conflict('A user with this phone number already exists.');
  }

  const tempPassword = generateTempPassword();
  const password = await hashPassword(tempPassword);

  const created = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone || null,
      password,
      role: 'ADMINISTRATOR',
      isVerified: true, // admins are pre-verified; they sign in with the temp password
      isActive: true,
    },
    select: ADMIN_SELECT,
  });

  // Best-effort invite email (never fails the creation).
  await sendAdminWelcomeEmail(email, created.name, tempPassword).catch(() => undefined);

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'ADMIN_CREATE',
    target: 'User',
    targetId: created.id,
    ipAddress: actor.ip,
  });

  return { admin: mapAdmin(created), tempPassword };
}

export async function setAdminStatus(actor: Actor, id: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user || user.role !== 'ADMINISTRATOR') throw AppError.notFound('Administrator not found.');

  await prisma.user.update({ where: { id }, data: { isActive } });
  if (!isActive) await prisma.refreshToken.deleteMany({ where: { userId: id } });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: isActive ? 'ADMIN_ACTIVATE' : 'ADMIN_SUSPEND',
    target: 'User',
    targetId: id,
    ipAddress: actor.ip,
  });

  const fresh = await prisma.user.findUniqueOrThrow({ where: { id }, select: ADMIN_SELECT });
  return mapAdmin(fresh);
}

/**
 * Hard-deletes an administrator. Only permitted when the admin has no
 * referential history (products created, audit trail) — otherwise the Owner is
 * told to suspend instead, so we never orphan FKs or destroy the audit log.
 */
export async function deleteAdmin(actor: Actor, id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, _count: { select: { products: true, auditLogs: true } } },
  });
  if (!user || user.role !== 'ADMINISTRATOR') throw AppError.notFound('Administrator not found.');

  if (user._count.products > 0 || user._count.auditLogs > 0) {
    throw AppError.conflict(
      'This admin has product or activity history and cannot be deleted. Suspend the account instead to preserve records.',
    );
  }

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
    prisma.oTPRecord.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'ADMIN_DELETE',
    target: 'User',
    targetId: id,
    ipAddress: actor.ip,
  });

  return { id };
}

// ───────────────────────── Deletion requests ─────────────────────────

export async function listDeletionRequests(opts: { status?: 'pending' | 'all' }) {
  const where: Prisma.DeletionRequestWhereInput = {};
  if (opts.status !== 'all') where.status = 'PENDING';

  const requests = await prisma.deletionRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, basePrice: true,
          category: { select: { name: true } },
          images: { where: { isMain: true }, take: 1, select: { url: true } },
          _count: { select: { orderItems: true } },
        },
      },
    },
  });

  // Resolve requester / reviewer names in one round-trip.
  const userIds = [
    ...new Set(requests.flatMap((r) => [r.requestedBy, r.reviewedBy].filter(Boolean) as string[])),
  ];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const nameOf = new Map(users.map((u) => [u.id, u.name]));

  return requests.map((r) => ({
    id: r.id,
    status: r.status,
    reason: r.reason,
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt,
    requestedBy: nameOf.get(r.requestedBy) ?? 'Unknown',
    reviewedBy: r.reviewedBy ? nameOf.get(r.reviewedBy) ?? 'Unknown' : null,
    product: {
      id: r.product.id,
      name: r.product.name,
      slug: r.product.slug,
      basePrice: Number(r.product.basePrice),
      category: r.product.category?.name ?? '—',
      image: r.product.images[0]?.url ?? null,
      orderCount: r.product._count.orderItems,
    },
  }));
}
