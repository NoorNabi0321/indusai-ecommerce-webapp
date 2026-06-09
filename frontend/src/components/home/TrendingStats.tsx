import { useCountUp } from '@/hooks/useCountUp';

interface Stat {
  target: number;
  format: (v: number) => string;
  label: string;
}

const STATS: Stat[] = [
  { target: 12000, format: (v) => `${v.toLocaleString()}+`, label: 'Orders Delivered' },
  { target: 48, format: (v) => `${(v / 10).toFixed(1)}★`, label: 'Average Rating' },
  { target: 500, format: (v) => `${v}+`, label: 'Products' },
];

function StatItem({ stat }: { stat: Stat }) {
  const { ref, value } = useCountUp(stat.target);
  return (
    <div className="text-center">
      <span ref={ref} className="font-display text-2xl font-bold tabular-nums text-gradient-gold md:text-3xl">
        {stat.format(value)}
      </span>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
}

export function TrendingStats() {
  return (
    <section className="border-y border-border bg-gold-base/[0.04]">
      <div className="container grid grid-cols-3 gap-6 py-12">
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
