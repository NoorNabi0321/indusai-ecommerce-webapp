import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientOrbs } from '@/components/common/GradientOrbs';
import { useFeaturedProducts } from '@/hooks/useProducts';

const HEADLINE = ['Shop', 'Premium.', 'Shop', 'Smart.'];

export function AnimatedHero() {
  const reduce = useReducedMotion();
  const { data: featured } = useFeaturedProducts(3);
  const previews = (featured ?? [])
    .map((p) => p.images?.find((i) => i.isMain)?.url ?? p.images?.[0]?.url)
    .filter(Boolean) as string[];

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      <GradientOrbs />
      <div className="container relative z-10 grid items-center gap-10 py-20 lg:grid-cols-2">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-gold-glow"
          >
            <Sparkles className="size-3.5" /> AI-powered shopping, made local
          </motion.div>

          <h1 className="font-display text-3xl font-bold leading-[1.05] text-foreground md:text-4xl">
            {HEADLINE.map((word, i) => (
              <motion.span
                key={i}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.12, ease: 'easeOut', duration: 0.5 }}
                className={i >= 2 ? 'text-gradient-gold' : undefined}
              >
                {word}{' '}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mx-auto mt-5 max-w-md text-base text-muted-foreground lg:mx-0"
          >
            AI-powered recommendations. Local payment. Fast delivery across Pakistan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Button asChild size="lg">
              <Link to="/shop/shirts">
                <ShoppingBag /> Shop Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#picks">
                <Sparkles /> Explore AI Picks
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Floating product previews */}
        <div className="relative hidden h-[420px] lg:block">
          {previews.slice(0, 3).map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 80 }}
              className="absolute overflow-hidden rounded-2xl border border-border shadow-elev-3"
              style={POSITIONS[i]}
            >
              <motion.img
                src={src}
                alt=""
                className="size-full object-cover"
                animate={reduce ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#categories"
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="size-6" />
      </motion.a>
    </section>
  );
}

const POSITIONS: React.CSSProperties[] = [
  { width: 200, height: 260, right: 40, top: 10 },
  { width: 170, height: 220, left: 10, top: 80 },
  { width: 150, height: 190, right: 90, bottom: 0 },
];
