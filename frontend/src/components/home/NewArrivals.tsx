import { Sparkles } from 'lucide-react';
import { useNewArrivals } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { SectionHeading } from './SectionHeading';

export function NewArrivals() {
  const { data: products, isLoading } = useNewArrivals(8);

  return (
    <section className="container py-16">
      <SectionHeading title="New Arrivals" icon={Sparkles} linkTo="/shop/shirts" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
