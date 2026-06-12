import { prisma } from '../config/database';

const LOW_STOCK_THRESHOLD = 5;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function emptyDayBuckets(start: Date, days: number) {
  const buckets = new Map<string, { date: string; gross: number; refunds: number; net: number }>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(dayKey(d), { date: dayKey(d), gross: 0, refunds: 0, net: 0 });
  }
  return buckets;
}

/**
 * Owner financial dashboard (OWNER-only). All money is realised from the
 * Payment ledger: PAID = revenue, REFUNDED = refund. There is no cost-of-goods
 * field in the schema, so "profit/expenses" are intentionally NOT fabricated —
 * we report gross / refunds / net, which are all real.
 */
export async function getOwnerDashboard(days = 30) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const start = new Date(startOfToday);
  start.setDate(start.getDate() - (days - 1));

  const [
    payments,
    totalOrders,
    newCustomers,
    pendingOrders,
    pendingDeletions,
    lowStock,
    pendingReturns,
    shippingAgg,
    activityRaw,
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { createdAt: { gte: start }, status: { in: ['PAID', 'REFUNDED'] } },
      select: { createdAt: true, amount: true, status: true, method: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: start } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: start } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.deletionRequest.count({ where: { status: 'PENDING' } }),
    prisma.productVariant.count({ where: { stock: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.returnRequest.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { shippingCost: true }, where: { createdAt: { gte: start }, payment: { status: 'PAID' } } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, action: true, target: true, ipAddress: true, createdAt: true, actorRole: true,
        actor: { select: { name: true } },
      },
    }),
  ]);

  // ── Money + per-day series + payment breakdown ──
  const buckets = emptyDayBuckets(start, days);
  const methodMap = new Map<string, { amount: number; count: number }>();
  let gross = 0;
  let refunds = 0;
  let paidOrders = 0;

  for (const p of payments) {
    const amount = Number(p.amount);
    const b = buckets.get(dayKey(p.createdAt));
    if (p.status === 'PAID') {
      gross += amount;
      paidOrders += 1;
      if (b) b.gross += amount;
      const m = methodMap.get(p.method) ?? { amount: 0, count: 0 };
      m.amount += amount;
      m.count += 1;
      methodMap.set(p.method, m);
    } else {
      refunds += amount;
      if (b) b.refunds += amount;
    }
  }
  for (const b of buckets.values()) b.net = b.gross - b.refunds;

  const net = gross - refunds;

  const paymentBreakdown = [...methodMap.entries()].map(([method, v]) => ({
    method,
    amount: v.amount,
    count: v.count,
  }));

  const recentActivity = activityRaw.map((a) => ({
    id: a.id,
    action: a.action,
    target: a.target,
    actor: a.actor?.name ?? 'System',
    actorRole: a.actorRole,
    ipAddress: a.ipAddress,
    createdAt: a.createdAt,
  }));

  return {
    rangeDays: days,
    metrics: {
      grossRevenue: gross,
      netRevenue: net,
      refunds,
      totalOrders,
      paidOrders,
      avgOrderValue: paidOrders ? gross / paidOrders : 0,
      newCustomers,
      shippingCollected: Number(shippingAgg._sum.shippingCost ?? 0),
    },
    financialSeries: [...buckets.values()],
    paymentBreakdown,
    pendingActions: { pendingOrders, pendingDeletions, lowStock, pendingReturns },
    recentActivity,
  };
}

/** Detailed financials for a custom date range (OWNER-only). */
export async function getOwnerFinancials(opts: { from?: Date; to?: Date }) {
  const to = opts.to ?? new Date();
  to.setHours(23, 59, 59, 999);
  const from = opts.from ?? new Date(to.getTime() - 29 * 86_400_000);
  from.setHours(0, 0, 0, 0);

  const dayCount = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);

  const [payments, ordersAgg, paidOrderItems] = await Promise.all([
    prisma.payment.findMany({
      where: { createdAt: { gte: from, lte: to }, status: { in: ['PAID', 'REFUNDED'] } },
      select: { createdAt: true, amount: true, status: true, method: true },
    }),
    prisma.order.aggregate({
      _sum: { shippingCost: true, discount: true },
      _count: true,
      where: { createdAt: { gte: from, lte: to }, payment: { status: 'PAID' } },
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: from, lte: to }, payment: { status: 'PAID' } } },
      select: { productId: true, quantity: true, price: true, product: { select: { name: true } } },
    }),
  ]);

  const buckets = emptyDayBuckets(from, dayCount);
  const methodMap = new Map<string, { revenue: number; orders: number }>();
  let gross = 0;
  let refunds = 0;
  let paidOrders = 0;

  for (const p of payments) {
    const amount = Number(p.amount);
    const b = buckets.get(dayKey(p.createdAt));
    if (p.status === 'PAID') {
      gross += amount;
      paidOrders += 1;
      if (b) b.gross += amount;
      const m = methodMap.get(p.method) ?? { revenue: 0, orders: 0 };
      m.revenue += amount;
      m.orders += 1;
      methodMap.set(p.method, m);
    } else {
      refunds += amount;
      if (b) b.refunds += amount;
    }
  }
  for (const b of buckets.values()) b.net = b.gross - b.refunds;

  // ── Product performance (realised revenue per product) ──
  const prodMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const it of paidOrderItems) {
    const entry = prodMap.get(it.productId) ?? { name: it.product.name, units: 0, revenue: 0 };
    entry.units += it.quantity;
    entry.revenue += Number(it.price) * it.quantity;
    prodMap.set(it.productId, entry);
  }
  const productPerformance = [...prodMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    summary: {
      grossRevenue: gross,
      refunds,
      netRevenue: gross - refunds,
      paidOrders,
      avgOrderValue: paidOrders ? gross / paidOrders : 0,
      shippingCollected: Number(ordersAgg._sum.shippingCost ?? 0),
      discountsGiven: Number(ordersAgg._sum.discount ?? 0),
    },
    revenueSeries: [...buckets.values()],
    paymentMethods: [...methodMap.entries()].map(([method, v]) => ({ method, ...v })),
    productPerformance,
  };
}
