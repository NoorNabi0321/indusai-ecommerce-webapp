import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  icon?: LucideIcon;
  linkTo?: string;
  linkLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeading({
  title,
  icon: Icon,
  linkTo,
  linkLabel = 'View all',
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-6 flex items-end justify-between gap-4', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-5 text-gold-base" />}
        <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">{title}</h2>
        {children}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold-base"
        >
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
