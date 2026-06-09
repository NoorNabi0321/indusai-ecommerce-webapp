import { cn } from '@/lib/utils';
import { formatPrice, discountPercent } from '@/lib/utils';

interface PriceDisplayProps {
  basePrice: number;
  comparePrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'text-md',
  md: 'text-lg',
  lg: 'text-2xl',
} as const;

export function PriceDisplay({ basePrice, comparePrice, size = 'sm', className }: PriceDisplayProps) {
  const hasDeal = comparePrice != null && comparePrice > basePrice;
  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('font-display font-semibold tabular-nums text-gold-base', SIZES[size])}>
        {formatPrice(basePrice)}
      </span>
      {hasDeal && (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {formatPrice(comparePrice)}
          </span>
          <span className="text-xs font-medium text-success">
            -{discountPercent(basePrice, comparePrice)}%
          </span>
        </>
      )}
    </div>
  );
}
