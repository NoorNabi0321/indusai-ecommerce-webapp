import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

/** Read-only star rating with optional review count. */
export function StarRating({ value, count, size = 14, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= Math.round(value) ? 'fill-gold-base text-gold-base' : 'fill-transparent text-bg-overlay',
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {value > 0 ? value.toFixed(1) : 'New'}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
