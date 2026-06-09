import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product.types';
import { getProducts } from '@/lib/api/product.api';
import { ProductCard } from './ProductCard';
import { ProductReviews } from './ProductReviews';

const TABS = ['Description', 'Specifications', 'Reviews', 'Similar'] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>('Description');

  const sizes = [...new Set((product.variants ?? []).map((v) => v.size).filter(Boolean))];
  const colors = [...new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
              tab === t ? 'text-gold-base' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
            {t === 'Reviews' && product.reviewStats ? ` (${product.reviewStats.count})` : ''}
            {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold-base" />}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === 'Description' && (
          <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        {tab === 'Specifications' && (
          <table className="w-full max-w-2xl text-sm">
            <tbody className="divide-y divide-border">
              {[
                ['Brand', product.brand ?? '—'],
                ['Category', product.category?.name ?? '—'],
                ['Available sizes', sizes.length ? sizes.join(', ') : '—'],
                ['Available colours', colors.length ? colors.join(', ') : '—'],
                ['Tags', product.tags?.join(', ') || '—'],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2.5 pr-4 font-medium text-foreground">{k}</td>
                  <td className="py-2.5 text-muted-foreground">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'Reviews' && (
          <ProductReviews
            productId={product.id}
            slug={product.slug}
            stats={product.reviewStats ?? { average: 0, count: 0, histogram: [0, 0, 0, 0, 0] }}
          />
        )}

        {tab === 'Similar' && <SimilarProducts product={product} />}
      </div>
    </div>
  );
}

function SimilarProducts({ product }: { product: Product }) {
  const { data, isLoading } = useQuery({
    queryKey: ['similar', product.category?.slug, product.id],
    queryFn: () => getProducts({ category: product.category?.slug, limit: 8 }),
    enabled: Boolean(product.category?.slug),
  });

  const similar = (data?.items ?? []).filter((p) => p.id !== product.id).slice(0, 6);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (similar.length === 0) return <p className="text-sm text-muted-foreground">No similar products found.</p>;

  return (
    <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-3">
      {similar.map((p) => (
        <div key={p.id} className="w-[200px] shrink-0">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
