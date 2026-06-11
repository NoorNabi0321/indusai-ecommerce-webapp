import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Banknote, Clock, AlertTriangle, Lock, ShieldAlert, ImageOff } from 'lucide-react';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getAdminDashboard } from '@/lib/api/dashboard.api';
import { SalesChart } from '@/components/charts/SalesChart';
import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function AdminDashboardPage() {
  const [days, setDays] = useState<7 | 30>(7);

  useEffect(() => {
    document.title = `Dashboard · ${APP_NAME} Admin`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', days],
    queryFn: () => getAdminDashboard(days),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    );
  }

  const { metrics } = data;
  const cards = [
    { label: "Today's Orders", value: String(metrics.ordersToday), icon: ShoppingBag, color: 'text-info' },
    {
      label: "Today's Revenue",
      value: metrics.revenueToday != null ? formatPrice(metrics.revenueToday) : null,
      icon: Banknote,
      color: 'text-success',
    },
    { label: 'Pending Orders', value: String(metrics.pendingOrders), icon: Clock, color: 'text-warning' },
    { label: 'Low Stock Alerts', value: String(metrics.lowStockCount), icon: AlertTriangle, color: 'text-error' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold text-foreground">Dashboard</h1>

      {data.pendingDeletions > 0 && (
        <Link to="/owner/deletions" className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <ShieldAlert className="size-5" />
          {data.pendingDeletions} product deletion request{data.pendingDeletions === 1 ? '' : 's'} awaiting Owner approval.
        </Link>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className={cn('grid size-9 place-items-center rounded-md bg-bg-elevated', c.color)}>
                <c.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-foreground tabular-nums">
              {c.value ?? <span className="inline-flex items-center gap-1 text-sm font-normal text-muted-foreground"><Lock className="size-3.5" /> Owner only</span>}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-md font-semibold text-foreground">Sales over time</h2>
            <div className="flex rounded-md border border-border text-xs">
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn('px-2.5 py-1', days === d ? 'bg-gold-base text-bg-base' : 'text-muted-foreground')}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <SalesChart data={data.salesSeries} showRevenue={data.isOwner} />
        </div>

        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-md font-semibold text-foreground">Sales by category</h2>
          <CategoryDonut data={data.categoryBreakdown} />
        </div>
      </div>

      {/* Recent orders + top products */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-md font-semibold text-foreground">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gold-base hover:underline">View all</Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {data.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-bg-elevated/50">
                      <td className="py-2.5">
                        <Link to={`/admin/orders/${o.id}`} className="font-medium text-foreground hover:text-gold-base">{o.orderNumber}</Link>
                        <p className="text-xs text-muted-foreground">{o.customer}</p>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{formatDate(o.createdAt)}</td>
                      <td className="py-2.5 tabular-nums text-foreground">{formatPrice(o.total)}</td>
                      <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-md font-semibold text-foreground">Top Products</h2>
          {data.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-bg-elevated text-muted-foreground">
                    {p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : <ImageOff className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.unitsSold} sold</span>
                  </span>
                  {p.revenue != null && <span className="text-sm tabular-nums text-gold-base">{formatPrice(p.revenue)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
