import { formatPrice } from '@/lib/utils';

interface PriceRangeProps {
  min: number;
  max: number;
  lo: number;
  hi: number;
  onChange: (lo: number, hi: number) => void;
}

/** Dual-handle price slider (two overlaid range inputs; thumbs interactive via CSS). */
export function PriceRange({ min, max, lo, hi, onChange }: PriceRangeProps) {
  const range = Math.max(1, max - min);
  const loPct = ((lo - min) / range) * 100;
  const hiPct = ((hi - min) / range) * 100;

  return (
    <div className="space-y-3 px-1">
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-bg-overlay" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold-base"
          style={{ left: `${loPct}%`, width: `${Math.max(0, hiPct - loPct)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => onChange(Math.min(Number(e.target.value), hi), hi)}
          className="range-input"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => onChange(lo, Math.max(Number(e.target.value), lo))}
          className="range-input"
          aria-label="Maximum price"
        />
      </div>
      <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>{formatPrice(lo)}</span>
        <span>{formatPrice(hi)}</span>
      </div>
    </div>
  );
}
