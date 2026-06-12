import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Banknote, TrendingUp, Undo2, ShoppingBag, CheckCircle2, Calculator, UserPlus, Truck,
  Clock, ShieldAlert, PackageX, RotateCcw, Activity, LogIn, ArrowRight, type LucideIcon,
} from 'lucide-react';
import { cn, formatPrice, formatDateTime } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getOwnerDashboard } from '@/lib/api/finance.api';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { PaymentDonut } from '@/components/charts/PaymentDonut';

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'signed in',
  PRODUCT_CREATE: 'created a product',
  PRODUCT_UPDATE: 'updated a product',
  STOCK_UPDATE: 'updated stock',
  STOCK_BULK_UPDATE: 'bulk-updated stock',
  ORDER_STATUS_UPDATE: 'updated an order',
  CUSTOMER_SUSPEND: 'suspended a customer',
  CUSTOMER_ACTIVATE: 'reactivated a customer',
  DELETION_REQUEST: 'requested a deletion',
};
const actionLabel = (a: string) => ACTION_LABELS[a] ?? a.replace(/_/g, ' ').toLowerCase();

export default function OwnerDashboardPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    document.title = `Owner Dashboard · ${APP_NAME}`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-dashboard', days],
    queryFn: () => getOwnerDashboard(days),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  const m = data.metrics;
  const cards: { label: string; value: string; icon: LucideIcon; color: string }[] = [
    { label: 'Gross Revenue', value: formatPrice(m.grossRevenue), icon: Banknote, color: 'text-gold-base' },
    { label: 'Net Revenue', value: formatPrice(m.netRevenue), icon: TrendingUp, color: 'text-success' },
    { label: 'Refunds', value: formatPrice(m.refunds), icon: Undo2, color: 'text-error' },
    { label: 'Total Orders', value: String(m.totalOrders), icon: ShoppingBag, color: 'text-info' },
    { label: 'Paid Orders', value: String(m.paidOrders), icon: CheckCircle2, color: 'text-success' },
    { label: 'Avg Order Value', value: formatPrice(m.avgOrderValue), icon: Calculator, color: 'text-gold-base' },
    { label: 'New Customers', value: String(m.newCustomers), icon: UserPlus, color: 'text-[#b794f6]' },
    { label: 'Shipping Collected', value: formatPrice(m.shippingCollected), icon: Truck, color: 'text-info' },
  ];

  const pa = data.pendingActions;
  const pending = [
    { label: 'Pending orders', value: pa.pendingOrders, icon: Clock, to: '/admin/orders', color: 'text-warning' },
    { label: 'Deletion approvals', value: pa.pendingDeletions, icon: ShieldAlert, to: '/owner/deletions', color: 'text-error' },
    { label: 'Low-stock variants', value: pa.lowStock, icon: PackageX, to: '/admin/inventory', color: 'text-warning' },
    { label: 'Return requests', value: pa.pendingReturns, icon: RotateCcw, to: '/admin/orders', color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-foreground">Owner Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link to="/owner/financials" className="inline-flex items-center gap-1 text-sm text-gold-base hover:underline">
            Detailed financials <ArrowRight className="size-4" />
          </Link>
          <div className="flex rounded-md border border-border text-xs">
            {([7, 30, 90] as const).map((d) => (
              <button key={d} onClick={() => setDays(d)} className={cn('px-2.5 py-1', days === d ? 'bg-gold-base text-bg-base' : 'text-muted-foreground')}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8 metric cards (2 rows) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-bg-surface p-4">
            <span className={cn('grid size-9 place-items-center rounded-md bg-bg-elevated', c.color)}>
              <c.icon className="size-4" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold text-foreground tabular-nums">{c.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Financial chart + payment donut */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-3">
          <h2 className="mb-1 font-display text-md font-semibold text-foreground">Financial overview</h2>
          <p className="mb-3 text-xs text-muted-foreground">Gross, net and refunds over the last {data.rangeDays} days.</p>
          <FinancialChart data={data.financialSeries} />
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-md font-semibold text-foreground">Revenue by payment method</h2>
          <PaymentDonut data={data.paymentBreakdown} />
        </div>
      </div>

      {/* Pending actions + activity log */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-md font-semibold text-foreground">Pending actions</h2>
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.label}>
                <Link to={p.to} className="flex items-center gap-3 rounded-lg border border-border bg-bg-base p-3 transition-colors hover:border-gold-dim">
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-md bg-bg-elevated', p.color)}>
                    <p.icon className="size-4" />
                  </span>
                  <span className="flex-1 text-sm text-foreground">{p.label}</span>
                  <span className={cn('font-display text-lg font-bold tabular-nums', p.value > 0 ? 'text-foreground' : 'text-muted-foreground')}>{p.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-bg-surface p-5 lg:col-span-3">
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-md font-semibold text-foreground">
            <Activity className="size-4 text-gold-base" /> Staff activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-bg-elevated text-muted-foreground">
                    {a.action === 'LOGIN' ? <LogIn className="size-3.5 text-success" /> : <Activity className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground">
                      <span className="font-medium">{a.actor}</span>{' '}
                      <span className="text-muted-foreground">{actionLabel(a.action)}</span>
                      {a.target && <span className="text-muted-foreground"> · {a.target}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{formatDateTime(a.createdAt)}{a.ipAddress ? ` · ${a.ipAddress}` : ''}</p>
                  </div>
                  <span className="shrink-0 rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{a.actorRole}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
