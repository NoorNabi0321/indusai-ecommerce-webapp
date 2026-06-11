import type { UserRole } from '@prisma/client';
import { prisma } from '../config/database';

const LOW_STOCK_THRESHOLD = 5;

/** Aggregated metrics for the Admin/Owner dashboard. Revenue is Owner-only (RBAC). */
export async function getAdminDashboard(role: UserRole, days = 7) {
  const isOwner = role === 'OWNER';
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const seriesStart = new Date(startOfToday);
  seriesStart.setDate(seriesStart.getDate() - (days - 1));

  const [ordersToday, todayAgg, pendingOrders, lowStockCount, pendingDeletions, recentRaw, topRaw, seriesOrders, catItems] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.productVariant.count({ where: { stock: { lte: LOW_STOCK_THRESHOLD } } }),
      prisma.deletionRequest.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } }, payment: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({ where: { createdAt: { gte: seriesStart } }, select: { createdAt: true, total: true } }),
      prisma.orderItem.findMany({
        select: { quantity: true, product: { select: { category: { select: { name: true } } } } },
      }),
    ]);

  const revenueToday = isOwner ? Number(todayAgg._sum.total ?? 0) : null;

  // ── Sales series (one bucket per day) ──
  const buckets = new Map<string, { date: string; orders: number; revenue: number }>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(seriesStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, orders: 0, revenue: 0 });
  }
  for (const o of seriesOrders) {
    const b = buckets.get(o.createdAt.toISOString().slice(0, 10));
    if (b) {
      b.orders += 1;
      b.revenue += Number(o.total);
    }
  }
  const salesSeries = [...buckets.values()].map((b) => ({
    date: b.date,
    orders: b.orders,
    ...(isOwner ? { revenue: b.revenue } : {}),
  }));

  // ── Category breakdown (units sold per category) ──
  const catMap = new Map<string, number>();
  for (const it of catItems) {
    const name = it.product.category?.name ?? 'Other';
    catMap.set(name, (catMap.get(name) ?? 0) + it.quantity);
  }
  const categoryBreakdown = [...catMap.entries()].map(([name, value]) => ({ name, value }));

  // ── Top products ──
  const topIds = topRaw.map((t) => t.productId);
  const topProducts = topIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, basePrice: true, images: { where: { isMain: true }, take: 1 } },
      })
    : [];
  const topMap = new Map(topProducts.map((p) => [p.id, p]));
  const top = topRaw.map((t) => {
    const p = topMap.get(t.productId);
    const units = t._sum.quantity ?? 0;
    return {
      id: t.productId,
      name: p?.name ?? '—',
      image: p?.images[0]?.url ?? null,
      unitsSold: units,
      revenue: isOwner ? Number(p?.basePrice ?? 0) * units : null,
    };
  });

  const recentOrders = recentRaw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user.name,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt,
    paymentMethod: o.payment?.method ?? null,
  }));

  return {
    isOwner,
    metrics: { ordersToday, revenueToday, pendingOrders, lowStockCount },
    salesSeries,
    categoryBreakdown,
    topProducts: top,
    recentOrders,
    pendingDeletions,
  };
}
