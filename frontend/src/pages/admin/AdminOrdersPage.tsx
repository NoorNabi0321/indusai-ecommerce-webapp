import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, Cog, Truck, CheckCircle2, Eye } from 'lucide-react';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { adminListOrders } from '@/lib/api/order.api';
import { StatusBadge } from '@/components/common/StatusBadge';

const STATUS_TABS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const;
const SUMMARY = [
  { key: 'PENDING', label: 'Pending', icon: Clock, color: 'text-warning' },
  { key: 'PROCESSING', label: 'Processing', icon: Cog, color: 'text-info' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'text-[#b794f6]' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, color: 'text-success' },
];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>('ALL');
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('');

  useEffect(() => {
    document.title = `Orders · ${APP_NAME} Admin`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, payment, search],
    queryFn: () =>
      adminListOrders({
        status: status === 'ALL' ? undefined : status,
        paymentMethod: payment || undefined,
        search: search || undefined,
        limit: 50,
      }),
  });

  const orders = data?.items ?? [];
  const counts = data?.counts ?? {};

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-foreground">Order Management</h1>

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {SUMMARY.map((s) => (
          <div key={s.key} className="rounded-xl border border-border bg-bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className={cn('grid size-9 place-items-center rounded-md bg-bg-elevated', s.color)}>
                <s.icon className="size-4" />
              </span>
              <span className="font-display text-2xl font-bold text-foreground tabular-nums">{counts[s.key] ?? 0}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setStatus(t)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                status === t ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {t.toLowerCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="h-9 rounded-md border border-input bg-bg-surface px-2 text-sm text-foreground outline-none"
          >
            <option value="">All payments</option>
            <option value="COD">COD</option>
            <option value="STRIPE">Card</option>
            <option value="JAZZCASH">JazzCash</option>
            <option value="EASYPAISA">Easypaisa</option>
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order # or customer…"
              className="h-9 w-52 rounded-md border border-input bg-bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-gold-dim"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Items</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-bg-elevated/50">
                  <td className="p-3 font-medium text-foreground">{o.orderNumber}</td>
                  <td className="p-3">
                    <p className="text-foreground">{o.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.email}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="p-3 text-muted-foreground">{o.itemCount}</td>
                  <td className="p-3 text-muted-foreground">{o.paymentMethod} · {o.paymentStatus}</td>
                  <td className="p-3 tabular-nums text-foreground">{formatPrice(o.total)}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3">
                    <Link to={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-gold-base hover:underline">
                      <Eye className="size-4" /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
