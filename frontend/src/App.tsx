import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { APP_NAME, APP_TAGLINE, CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

/**
 * Phase 1.2 design-system smoke screen.
 * Confirms Tailwind tokens, fonts, glassmorphism, Framer Motion, and Shadcn
 * primitives all render. Replaced by the real router + pages in Subphase 1.4.
 */
export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-orb-float absolute -left-20 top-10 h-72 w-72 rounded-full bg-gold-base/25 blur-[80px]" />
        <div className="animate-orb-float absolute right-0 top-40 h-80 w-80 rounded-full bg-[#6C3ABF]/25 blur-[80px] [animation-delay:2s]" />
        <div className="animate-orb-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#0F4F4F]/30 blur-[80px] [animation-delay:4s]" />
      </div>

      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center gap-12 py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-gold-glow">
            <Sparkles className="size-4" />
            Design system online — Phase 1.2
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {APP_NAME}
          </h1>
          <p className="mt-3 font-display text-xl text-gradient-gold md:text-2xl">
            {APP_TAGLINE}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            AI-powered recommendations. Local payment. Fast delivery.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg">
              <ShoppingBag /> Shop Now
            </Button>
            <Button size="lg" variant="outline">
              <Sparkles /> Explore AI Picks
            </Button>
          </div>
        </motion.div>

        {/* Category token preview */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
            >
              <Card className="transition-all hover:-translate-y-1 hover:shadow-elev-2">
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>from {formatPrice(999)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4 text-success" />
                    Authentic
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground/60">
          Next: Subphase 1.4 — routing shell &amp; 47 page placeholders.
        </p>
      </div>
    </main>
  );
}
