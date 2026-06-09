import type { Product } from '@/types/product.types';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  layout: 'grid' | 'list';
  loading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({ products, layout, loading, skeletonCount = 9 }: ProductGridProps) {
  const isListView = layout === 'list';
  const wrapperClass = isListView
    ? 'flex flex-col gap-3'
    : 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';

  if (loading && products.length === 0) {
    return (
      <div className={wrapperClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} className={cn(isListView && 'h-32 flex-row')} />
        ))}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} layout={layout} />
      ))}
    </div>
  );
}
