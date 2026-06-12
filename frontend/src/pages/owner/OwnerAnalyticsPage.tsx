import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getOwnerAnalytics, type Forecast } from '@/lib/api/analytics.api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function shortDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function OwnerAnalyticsPage() {
  const [days, setDays] = useState<30 | 90 | 180>(90);

  useEffect(() => {
    document.title = `Sales Analytics · ${APP_NAME}`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-analytics', days],
    queryFn: () => getOwnerAnalytics(days),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-44 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="skeleton h-72 rounded-xl" />
          <div className="skeleton h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-foreground">Sales Analytics</h1>
        <div className="flex rounded-md border border-border text-xs">
          {([30, 90, 180] as const).map((d) => (
            <button key={d} onClick={() => setDays(d)} className={cn('px-2.5 py-1', days === d ? 'bg-gold-base text-bg-base' : 'text-muted-foreground')}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights / forecast */}
      <ForecastPanel forecast={data.forecast} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales by category */}
        <section className="rounded-xl border border-border bg-bg-surface p-5">
          <h2 className="mb-3 font-display text-md font-semibold text-foreground">Sales by category</h2>
          {data.salesByCategory.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.salesByCategory} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" horizontal={false} />
                <XAxis type="number" stroke="#6E6D69" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" stroke="#6E6D69" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number, n: string) => (n === 'revenue' ? [formatPrice(v), 'Revenue'] : [v, 'Units'])}
                />
                <Bar dataKey="revenue" fill="#E4A93A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Customer acquisition */}
        <section className="rounded-xl border border-border bg-bg-surface p-5">
          <h2 className="mb-3 font-display text-md font-semibold text-foreground">Customer acquisition</h2>
          {data.customerAcquisition.every((w) => w.verified + w.unverified === 0) ? (
            <Empty label="No new customers in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.customerAcquisition} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
                <XAxis dataKey="week" tickFormatter={shortDate} stroke="#6E6D69" fontSize={11} tickLine={false} />
                <YAxis stroke="#6E6D69" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
                  labelFormatter={shortDate}
                  formatter={(v: number, n: string) => [v, n === 'verified' ? 'Verified' : 'Unverified']}
                />
                <Legend iconType="circle" formatter={(v) => <span style={{ color: '#B0AFAC', fontSize: 12 }}>{v === 'verified' ? 'Verified' : 'Unverified'}</span>} />
                <Bar dataKey="verified" stackId="a" fill="#2ECC71" radius={[0, 0, 0, 0]} />
                <Bar dataKey="unverified" stackId="a" fill="#6C3ABF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      {/* Sales heatmap */}
      <section className="rounded-xl border border-border bg-bg-surface p-5">
        <h2 className="mb-1 font-display text-md font-semibold text-foreground">Order heatmap</h2>
        <p className="mb-4 text-xs text-muted-foreground">Order volume by weekday and hour of day.</p>
        <Heatmap cells={data.heatmap} />
      </section>

      {/* Conversion funnel */}
      <section className="rounded-xl border border-border bg-bg-surface p-5">
        <h2 className="mb-1 font-display text-md font-semibold text-foreground">Conversion funnel</h2>
        <p className="mb-4 text-xs text-muted-foreground">From registered customers to delivered orders (tracked events only).</p>
        <Funnel stages={data.funnel} />
      </section>
    </div>
  );
}

function ForecastPanel({ forecast }: { forecast: Forecast }) {
  const combined = useMemo(() => {
    const rows: { date: string; actual?: number; predicted?: number }[] = forecast.history.map((p) => ({ date: p.date, actual: p.value }));
    const last = forecast.history[forecast.history.length - 1];
    if (last) rows[rows.length - 1].predicted = last.value;
    for (const p of forecast.prediction) rows.push({ date: p.date, predicted: p.value });
    return rows;
  }, [forecast]);

  const TrendIcon = forecast.trend === 'up' ? TrendingUp : forecast.trend === 'down' ? TrendingDown : Minus;
  const trendColor = forecast.trend === 'up' ? 'text-success' : forecast.trend === 'down' ? 'text-error' : 'text-muted-foreground';
  const confPct = Math.round(forecast.confidence * 100);
  const confLabel = confPct >= 60 ? 'High' : confPct >= 30 ? 'Moderate' : 'Low';
  const confColor = confPct >= 60 ? 'bg-success/15 text-success' : confPct >= 30 ? 'bg-warning/15 text-warning' : 'bg-error/15 text-error';

  return (
    <section className="rounded-xl border border-gold-dim/40 bg-gradient-to-br from-bg-surface to-gold-base/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-md bg-gold-base/15 text-gold-base"><Sparkles className="size-4" /></span>
        <h2 className="font-display text-md font-semibold text-foreground">AI Sales Forecast</h2>
        <span className="ml-auto rounded-full bg-bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted-foreground">TensorFlow.js · linear trend</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Predicted orders (next 7 days)</p>
            <p className="flex items-center gap-2 font-display text-3xl font-bold text-foreground tabular-nums">
              {forecast.predictedTotal}
              <span className={cn('inline-flex items-center gap-0.5 text-sm', trendColor)}>
                <TrendIcon className="size-4" />{forecast.changePct > 0 ? '+' : ''}{forecast.changePct}%
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', confColor)}>{confLabel} confidence · {confPct}%</span>
          </div>
          {!forecast.sufficient && (
            <p className="flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              Limited history ({forecast.dataPoints} active day{forecast.dataPoints === 1 ? '' : 's'}). Treat this as directional only — accuracy improves as more orders accrue.
            </p>
          )}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={combined} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} stroke="#6E6D69" fontSize={11} tickLine={false} minTickGap={24} />
            <YAxis stroke="#6E6D69" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
              labelFormatter={shortDate}
              formatter={(v: number, n: string) => [v, n === 'actual' ? 'Actual' : 'Forecast']}
            />
            <Line type="monotone" dataKey="actual" stroke="#E4A93A" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="predicted" stroke="#6C3ABF" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Heatmap({ cells }: { cells: { day: number; hour: number; count: number }[] }) {
  const lookup = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c.count]));
  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="mb-1 grid grid-cols-[32px_repeat(24,1fr)] gap-0.5">
          <span />
          {Array.from({ length: 24 }).map((_, h) => (
            <span key={h} className="text-center text-[9px] text-muted-foreground">{h % 3 === 0 ? h : ''}</span>
          ))}
        </div>
        {DAYS.map((label, day) => (
          <div key={day} className="mb-0.5 grid grid-cols-[32px_repeat(24,1fr)] items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            {Array.from({ length: 24 }).map((_, hour) => {
              const count = lookup.get(`${day}-${hour}`) ?? 0;
              const intensity = count / max;
              return (
                <div
                  key={hour}
                  title={`${label} ${hour}:00 — ${count} order${count === 1 ? '' : 's'}`}
                  className="aspect-square rounded-[2px] border border-border/40"
                  style={{ backgroundColor: count === 0 ? 'transparent' : `rgba(228,169,58,${0.15 + intensity * 0.85})` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Funnel({ stages }: { stages: { stage: string; value: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  const first = stages[0]?.value || 1;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pctOfMax = (s.value / max) * 100;
        const pctOfTop = Math.round((s.value / first) * 100);
        return (
          <div key={s.stage} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm text-muted-foreground">{s.stage}</span>
            <div className="relative h-9 flex-1 overflow-hidden rounded-md bg-bg-base">
              <div
                className="flex h-full items-center rounded-md bg-gradient-to-r from-gold-base to-gold-dim px-3 text-sm font-semibold text-bg-base transition-all"
                style={{ width: `${Math.max(pctOfMax, 8)}%` }}
              >
                {s.value}
              </div>
            </div>
            <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">{i === 0 ? '100%' : `${pctOfTop}%`}</span>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ label = 'No sales data yet.' }: { label?: string }) {
  return <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">{label}</div>;
}
