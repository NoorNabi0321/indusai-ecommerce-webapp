import { cn } from '@/lib/utils';

/**
 * Animated gradient mesh — three blurred, floating colour orbs
 * (gold / deep purple / dark teal) per the design system. Decorative only.
 */
export function GradientOrbs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="animate-orb-float absolute -left-20 top-10 h-72 w-72 rounded-full bg-gold-base/25 blur-[80px]" />
      <div className="animate-orb-float absolute right-0 top-40 h-80 w-80 rounded-full bg-[#6C3ABF]/25 blur-[80px] [animation-delay:2s]" />
      <div className="animate-orb-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#0F4F4F]/30 blur-[80px] [animation-delay:4s]" />
    </div>
  );
}
