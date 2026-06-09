import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';

/** Deterministic placeholder imagery (categories have no seed image). */
function categoryImage(slug: string): string {
  return `https://picsum.photos/seed/indusai-${slug}/600/800`;
}

export function CategoryStrip() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section id="categories" className="container py-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
            ))
          : categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: 'easeOut' }}
              >
                <Link
                  to={`/shop/${cat.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={categoryImage(cat.slug)}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">{cat.name}</h3>
                    <p className="text-sm text-white/70">{cat.productCount} products</p>
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-0 ring-gold-base/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-gold-base/60" />
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
