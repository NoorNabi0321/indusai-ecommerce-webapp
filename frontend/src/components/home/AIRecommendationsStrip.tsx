import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { ProductCard } from '@/components/product/ProductCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { SectionHeading } from './SectionHeading';

export function AIRecommendationsStrip() {
  const { data: products, isLoading, isError } = useFeaturedProducts(8);
  const { isAuthenticated } = useAuth();

  return (
    <section id="picks" className="container py-16">
      <SectionHeading title="Picked for you" icon={Sparkles}>
        {!isAuthenticated && (
          <Link to="/auth/login" className="ml-2 text-xs text-gold-base hover:underline">
            Sign in for personalised picks
          </Link>
        )}
      </SectionHeading>

      {isError ? (
        <p className="text-sm text-muted-foreground">Could not load recommendations right now.</p>
      ) : (
        <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-4 [scrollbar-width:thin]">
          {(isLoading ? Array.from({ length: 6 }) : (products ?? [])).map((p, i) => (
            <div key={(p as { id?: string })?.id ?? i} className="w-[220px] shrink-0">
              {isLoading ? <SkeletonCard /> : <ProductCard product={p as never} />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
