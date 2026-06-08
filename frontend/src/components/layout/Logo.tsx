import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  to?: string;
  className?: string;
  /** Optional small role label shown after the wordmark (e.g. "Admin", "Owner"). */
  badge?: string;
}

/** IndusAI gold wordmark. */
export function Logo({ to = '/', className, badge }: LogoProps) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2', className)}>
      <span className="grid size-8 place-items-center rounded-md bg-gradient-to-br from-gold-bright to-gold-dim font-display text-md font-bold text-bg-base">
        I
      </span>
      <span className="font-display text-md font-bold tracking-tight text-foreground">
        Indus<span className="text-gradient-gold">AI</span>
      </span>
      {badge && (
        <span className="rounded-sm border border-gold-dim/40 bg-gold-base/10 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-gold-base">
          {badge}
        </span>
      )}
    </Link>
  );
}
