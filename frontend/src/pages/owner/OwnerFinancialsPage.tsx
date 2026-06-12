import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Download, Banknote, Undo2, TrendingUp, Calculator } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getOwnerFinancials } from '@/lib/api/finance.api';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { Button } from '@/components/ui/button';

const METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  STRIPE: 'Card (Stripe)',
  JAZZCASH: 'JazzCash',
  EASYPAISA: 'Easypaisa',
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OwnerFinancialsPage() {
  const today = new Date();
  const monthAgo = new Date(today.getTime() - 29 * 86_400_000);
  const [from, setFrom] = useState(isoDate(monthAgo));
  const [to, setTo] = useState(isoDate(today));

  useEffect(() => {
    document.title = `Financial Statistics · ${APP_NAME}`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-financials', from, to],
    queryFn: () => getOwnerFinancials({ from, to }),
  });

  const summary = data?.summary;
  const cards = summary
    ? [
        { label: 'Gross Revenue', value: formatPrice(summary.grossRevenue), icon: Banknote, color: 'text-gold-base' },
        { label: 'Refunds', value: formatPrice(summary.refunds), icon: Undo2, color: 'text-error' },
        { label: 'Net Revenue', value: formatPrice(summary.netRevenue), icon: TrendingUp, color: 'text-success' },
        { label: 'Avg Order Value', value: formatPrice(summary.avgOrderValue), icon: Calculator, color: 'text-info' },
      ]
    : [];

  function exportPayments() {
    if (!data) return;
    downloadCsv(`payment-methods-${from}_${to}.csv`, data.paymentMethods.map((p) => ({
      method: METHOD_LABELS[p.method] ?? p.method, orders: p.orders, revenue: p.revenue,
    })));
  }
  function exportProducts() {
    if (!data) return;
    downloadCsv(`product-revenue-${from}_${to}.csv`, data.productPerformance.map((p) => ({
      product: p.name, units: p.units, revenue: p.revenue,
    })));
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/owner/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
          <ChevronLeft className="size-4" /> Back to dashboard
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-xl font-bold text-foreground">Financial Statistics</h1>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-muted-foreground">
              From
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-bg-surface px-2 text-sm text-foreground outline-none focus:border-gold-dim" />
            </label>
            <label className="text-xs text-muted-foreground">
              To
              <input type="date" value={to} min={from} max={isoDate(today)} onChange={(e) => setTo(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-bg-surface px-2 text-sm text-foreground outline-none focus:border-gold-dim" />
            </label>
          </div>
        </div>
      </div>

      {/* Note on cost basis */}
      <p className="rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-xs text-muted-foreground">
        Figures are realised from the payment ledger (PAID = revenue, REFUNDED = refund). Profit/margin is not shown — the catalogue has no cost-of-goods field yet.
      </p>

      {isLoading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
          <div className="skeleton h-72 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-bg-surface p-4">
                <span className={cn('grid size-9 place-items-center rounded-md bg-bg-elevated', c.color)}><c.icon className="size-4" /></span>
                <p className="mt-3 font-display text-2xl font-bold text-foreground tabular-nums">{c.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart (with refund overlay) */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <h2 className="mb-3 font-display text-md font-semibold text-foreground">Revenue & refunds</h2>
            <FinancialChart data={data.revenueSeries} />
          </div>

          {/* Payment method revenue table */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-md font-semibold text-foreground">Revenue by payment method</h2>
              <Button size="sm" variant="outline" onClick={exportPayments} disabled={data.paymentMethods.length === 0}><Download className="size-4" /> Export</Button>
            </div>
            {data.paymentMethods.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No paid orders in this range.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2 font-medium">Method</th><th className="py-2 font-medium">Orders</th><th className="py-2 text-right font-medium">Revenue</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.paymentMethods.map((p) => (
                    <tr key={p.method}>
                      <td className="py-2.5 text-foreground">{METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="py-2.5 text-muted-foreground tabular-nums">{p.orders}</td>
                      <td className="py-2.5 text-right tabular-nums text-foreground">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Product performance table */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-md font-semibold text-foreground">Top products by revenue</h2>
              <Button size="sm" variant="outline" onClick={exportProducts} disabled={data.productPerformance.length === 0}><Download className="size-4" /> Export</Button>
            </div>
            {data.productPerformance.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No sales in this range.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2 font-medium">Product</th><th className="py-2 font-medium">Units sold</th><th className="py-2 text-right font-medium">Revenue</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.productPerformance.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 text-foreground">{p.name}</td>
                      <td className="py-2.5 text-muted-foreground tabular-nums">{p.units}</td>
                      <td className="py-2.5 text-right tabular-nums text-gold-base">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
