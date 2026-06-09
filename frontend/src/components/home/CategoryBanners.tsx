import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useProducts';

function bannerImage(slug: string): string {
  return `https://picsum.photos/seed/indusai-banner-${slug}/800/600`;
}

// Bento sizing for the 2×2 feature grid.
const SPANS = ['md:col-span-2', 'md:row-span-2', '', 'md:col-span-2'];

export function CategoryBanners() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="container py-16">
      <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('skeleton rounded-2xl', SPANS[i])} />
            ))
          : categories?.slice(0, 4).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.slug}`}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-border',
                  SPANS[i],
                )}
              >
                <img
                  src={bannerImage(cat.slug)}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-bg-base/90 via-bg-base/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h3 className="font-display text-xl font-bold text-white">{cat.name}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm text-gold-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Shop now <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
