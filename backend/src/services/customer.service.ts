import { Prisma, type UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { writeAuditLog } from './audit.service';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

export async function listCustomers(opts: {
  search?: string;
  status?: 'active' | 'suspended';
  page?: number;
  limit?: number;
}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const where: Prisma.UserWhereInput = { role: 'CUSTOMER' };
  if (opts.status === 'active') where.isActive = true;
  else if (opts.status === 'suspended') where.isActive = false;
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { email: { contains: opts.search, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        isActive: true, createdAt: true, _count: { select: { orders: true } },
      },
    }),
  ]);

  const ids = users.map((u) => u.id);
  const spend = ids.length
    ? await prisma.order.groupBy({ by: ['userId'], where: { userId: { in: ids } }, _sum: { total: true } })
    : [];
  const spendMap = new Map(spend.map((s) => [s.userId, Number(s._sum.total ?? 0)]));

  const items = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    isActive: u.isActive,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
    totalSpent: spendMap.get(u.id) ?? 0,
  }));

  return { items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getCustomerProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true,
      isActive: true, isVerified: true, createdAt: true, role: true, addresses: true,
    },
  });
  if (!user || user.role !== 'CUSTOMER') throw AppError.notFound('Customer not found.');

  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } }, payment: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    addresses: user.addresses,
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      createdAt: o.createdAt,
      itemCount: o._count.items,
      paymentMethod: o.payment?.method ?? null,
    })),
    stats: {
      totalOrders: orders.length,
      totalSpent: orders.reduce((s, o) => s + Number(o.total), 0),
    },
  };
}

export async function setCustomerStatus(actor: Actor, id: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user || user.role !== 'CUSTOMER') throw AppError.notFound('Customer not found.');

  await prisma.user.update({ where: { id }, data: { isActive } });
  // Suspending forces a logout everywhere.
  if (!isActive) await prisma.refreshToken.deleteMany({ where: { userId: id } });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: isActive ? 'CUSTOMER_ACTIVATE' : 'CUSTOMER_SUSPEND',
    target: 'User',
    targetId: id,
    ipAddress: actor.ip,
  });

  return getCustomerProfile(id);
}
