import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

interface PlaceholderPageProps {
  /** Design-doc code, e.g. "C-01". */
  code: string;
  /** Human title, e.g. "Homepage". */
  title: string;
  /** Phase that implements the real page, e.g. "Phase 4.1". */
  phase?: string;
  /** Short description of what this page will contain. */
  description?: string;
}

/**
 * Styled "Coming Soon" placeholder used by every not-yet-built route in the
 * Phase 1.4 shell. Each real page replaces its registry entry in later phases.
 */
export function PlaceholderPage({ code, title, phase, description }: PlaceholderPageProps) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex min-h-[60vh] items-center justify-center px-6 py-16"
    >
      <div className="glass w-full max-w-md rounded-xl p-8 text-center">
        <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-gold-base/10 text-gold-base">
          <Hammer className="size-6" />
        </div>
        <span className="inline-block rounded-sm border border-border bg-bg-elevated px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {code}
        </span>
        <h1 className="mt-3 font-display text-xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <p className="mt-4 text-xs text-muted-foreground/70">
          Coming soon{phase ? ` — scheduled for ${phase}` : ''}.
        </p>
      </div>
    </motion.div>
  );
}
