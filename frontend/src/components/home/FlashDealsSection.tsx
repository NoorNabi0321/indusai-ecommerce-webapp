import { Zap } from 'lucide-react';
import { useFlashDeals } from '@/hooks/useProducts';
import { useCountdown } from '@/hooks/useCountdown';
import { ProductCard } from '@/components/product/ProductCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { SectionHeading } from './SectionHeading';

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function CountdownPill() {
  const { hours, minutes, seconds } = useCountdown(endOfToday());
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-bg-elevated px-2 py-1 font-mono text-sm tabular-nums text-gold-base">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

export function FlashDealsSection() {
  const { data: deals, isLoading } = useFlashDeals(5);

  if (!isLoading && (!deals || deals.length === 0)) return null;

  return (
    <section className="container py-16">
      <SectionHeading title="Flash Deals" icon={Zap} linkTo="/shop/shirts" linkLabel="View all deals">
        <CountdownPill />
      </SectionHeading>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} className={i === 0 ? 'col-span-2 row-span-2' : ''} />
            ))
          : deals?.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                className={i === 0 ? 'col-span-2 row-span-2' : ''}
              />
            ))}
      </div>
    </section>
  );
}
