import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { APP_TAGLINE } from '@/lib/constants';
import { GradientOrbs } from '@/components/common/GradientOrbs';
import { Logo } from './Logo';

const HIGHLIGHTS = [
  { icon: Sparkles, text: 'AI-powered recommendations' },
  { icon: Truck, text: 'Fast delivery across Pakistan' },
  { icon: ShieldCheck, text: 'Secure local & card payments' },
];

/**
 * Split-screen auth shell (≥lg): brand panel (45%) + form panel (55%).
 * On mobile: single column with the gradient mesh as full background.
 */
export function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-bg-base lg:grid lg:grid-cols-[45%_55%]">
      <GradientOrbs className="lg:hidden" />

      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-12">
        <GradientOrbs />
        <div className="relative z-10">
          <Logo />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10"
        >
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground">
            {APP_TAGLINE}
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-muted-foreground">
                <span className="grid size-9 place-items-center rounded-md bg-gold-base/10 text-gold-base">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </motion.div>
        <p className="relative z-10 text-sm text-muted-foreground/70">
          © {new Date().getFullYear()} IndusAI Technology
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
