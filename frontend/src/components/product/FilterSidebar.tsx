import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { cn, cssColor } from '@/lib/utils';
import type { Facets } from '@/hooks/useProducts';
import { PriceRange } from './PriceRange';

export interface FilterState {
  size: string[];
  color: string[];
  brand: string[];
  rating?: number;
  inStock?: boolean;
  priceLo?: number;
  priceHi?: number;
}

interface FilterSidebarProps {
  facets?: Facets;
  state: FilterState;
  onToggle: (key: 'size' | 'color' | 'brand', value: string) => void;
  onRating: (n?: number) => void;
  onInStock: (b: boolean) => void;
  onPrice: (lo: number, hi: number) => void;
  onClear: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-foreground"
      >
        {title}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function FilterSidebar({
  facets,
  state,
  onToggle,
  onRating,
  onInStock,
  onPrice,
  onClear,
}: FilterSidebarProps) {
  if (!facets) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded" />
        ))}
      </div>
    );
  }

  const lo = state.priceLo ?? facets.minPrice;
  const hi = state.priceHi ?? facets.maxPrice;

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-display text-md font-semibold text-foreground">Filters</h2>
        <button type="button" onClick={onClear} className="text-xs text-muted-foreground hover:text-gold-base">
          Clear all
        </button>
      </div>

      {facets.maxPrice > facets.minPrice && (
        <Section title="Price">
          <PriceRange min={facets.minPrice} max={facets.maxPrice} lo={lo} hi={hi} onChange={onPrice} />
        </Section>
      )}

      {facets.sizes.length > 0 && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onToggle('size', size)}
                className={cn(
                  'min-w-9 rounded-md border px-2 py-1.5 text-xs transition-colors',
                  state.size.includes(size)
                    ? 'border-gold-base bg-gold-base/10 text-gold-base'
                    : 'border-border text-muted-foreground hover:border-bg-overlay',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </Section>
      )}

      {facets.colors.length > 0 && (
        <Section title="Colour">
          <div className="space-y-2">
            {facets.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onToggle('color', color)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-1 py-1 text-sm transition-colors',
                  state.color.includes(color) ? 'text-gold-base' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'size-4 rounded-full border',
                    state.color.includes(color) ? 'ring-2 ring-gold-base ring-offset-1 ring-offset-bg-surface' : 'border-white/20',
                  )}
                  style={{ backgroundColor: cssColor(color) }}
                />
                {color}
              </button>
            ))}
          </div>
        </Section>
      )}

      {facets.brands.length > 0 && (
        <Section title="Brand">
          <div className="space-y-2">
            {facets.brands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={state.brand.includes(brand)}
                  onChange={() => onToggle('brand', brand)}
                  className="size-4 accent-gold-base"
                />
                {brand}
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section title="Rating">
        <div className="space-y-1.5">
          {[4, 3, 2].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRating(state.rating === n ? undefined : n)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-1 py-1 text-sm transition-colors',
                state.rating === n ? 'text-gold-base' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={cn('size-3.5', i <= n ? 'fill-gold-base text-gold-base' : 'text-bg-overlay')} />
                ))}
              </span>
              &amp; up
            </button>
          ))}
        </div>
      </Section>

      <Section title="Availability">
        <label className="flex cursor-pointer items-center justify-between text-sm text-muted-foreground">
          In stock only
          <input
            type="checkbox"
            checked={Boolean(state.inStock)}
            onChange={(e) => onInStock(e.target.checked)}
            className="size-4 accent-gold-base"
          />
        </label>
      </Section>
    </div>
  );
}
