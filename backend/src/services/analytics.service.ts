import { prisma } from '../config/database';
import { forecastSeries, type Forecast } from './forecast.service';

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface OwnerAnalytics {
  rangeDays: number;
  forecast: Forecast;
  salesByCategory: { category: string; units: number; revenue: number }[];
  customerAcquisition: { week: string; verified: number; unverified: number }[];
  heatmap: { day: number; hour: number; count: number }[];
  funnel: { stage: string; value: number }[];
}

/**
 * Owner analytics (OWNER-only): real aggregates + a TensorFlow.js sales-volume
 * forecast. Everything is derived from actual orders/customers — no synthetic
 * traffic. The conversion funnel uses what we genuinely track (customers, carts,
 * orders, deliveries), not page-view analytics we don't collect.
 */
export async function getOwnerAnalytics(days = 90): Promise<OwnerAnalytics> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const start = new Date(startOfToday);
  start.setDate(start.getDate() - (days - 1));

  const [orders, orderItems, customers, registered, withCart, orderedAgg, deliveredAgg] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: start } } },
      select: { quantity: true, price: true, product: { select: { category: { select: { name: true } } } } },
    }),
    prisma.user.findMany({ where: { role: 'CUSTOMER', createdAt: { gte: start } }, select: { createdAt: true, isVerified: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.cartItem.findMany({ distinct: ['userId'], select: { userId: true } }),
    prisma.order.findMany({ distinct: ['userId'], select: { userId: true } }),
    prisma.order.findMany({ where: { status: 'DELIVERED' }, distinct: ['userId'], select: { userId: true } }),
  ]);

  // ── Daily order-volume series (for the forecast) ──
  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dayBuckets.set(dayKey(d), 0);
  }
  for (const o of orders) {
    const k = dayKey(o.createdAt);
    if (dayBuckets.has(k)) dayBuckets.set(k, (dayBuckets.get(k) ?? 0) + 1);
  }
  const dailySeries = [...dayBuckets.entries()].map(([date, value]) => ({ date, value }));
  const forecast = await forecastSeries(dailySeries, 7);

  // ── Sales by category ──
  const catMap = new Map<string, { units: number; revenue: number }>();
  for (const it of orderItems) {
    const name = it.product.category?.name ?? 'Other';
    const entry = catMap.get(name) ?? { units: 0, revenue: 0 };
    entry.units += it.quantity;
    entry.revenue += Number(it.price) * it.quantity;
    catMap.set(name, entry);
  }
  const salesByCategory = [...catMap.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Customer acquisition (weekly, verified vs unverified) ──
  const weekMap = new Map<string, { verified: number; unverified: number }>();
  const weekCount = Math.ceil(days / 7);
  for (let i = 0; i < weekCount; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    weekMap.set(dayKey(d), { verified: 0, unverified: 0 });
  }
  const weekStarts = [...weekMap.keys()];
  for (const c of customers) {
    const offset = Math.floor((c.createdAt.getTime() - start.getTime()) / (7 * 86_400_000));
    const key = weekStarts[Math.min(Math.max(offset, 0), weekStarts.length - 1)];
    const bucket = weekMap.get(key)!;
    if (c.isVerified) bucket.verified += 1;
    else bucket.unverified += 1;
  }
  const customerAcquisition = [...weekMap.entries()].map(([week, v]) => ({ week, ...v }));

  // ── Sales heatmap (weekday × hour) ──
  const heatMap = new Map<string, number>();
  for (const o of orders) {
    const key = `${o.createdAt.getDay()}-${o.createdAt.getHours()}`;
    heatMap.set(key, (heatMap.get(key) ?? 0) + 1);
  }
  const heatmap: { day: number; hour: number; count: number }[] = [];
  for (const [key, count] of heatMap.entries()) {
    const [day, hour] = key.split('-').map(Number);
    heatmap.push({ day, hour, count });
  }

  // ── Conversion funnel (from what we actually track) ──
  const funnel = [
    { stage: 'Registered customers', value: registered },
    { stage: 'Added to cart', value: withCart.length },
    { stage: 'Placed an order', value: orderedAgg.length },
    { stage: 'Order delivered', value: deliveredAgg.length },
  ];

  return { rangeDays: days, forecast, salesByCategory, customerAcquisition, heatmap, funnel };
}
