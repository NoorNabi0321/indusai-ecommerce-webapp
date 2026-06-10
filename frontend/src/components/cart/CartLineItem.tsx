import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ImageOff } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { DisplayCartLine } from '@/hooks/useCart';

interface CartLineItemProps {
  line: DisplayCartLine;
  onQty: (line: DisplayCartLine, qty: number) => void;
  onRemove: (line: DisplayCartLine) => void;
  compact?: boolean;
  onNavigate?: () => void;
}

export function CartLineItem({ line, onQty, onRemove, compact, onNavigate }: CartLineItemProps) {
  const variantLabel = [line.color, line.size].filter(Boolean).join(' · ');

  return (
    <div className="flex gap-3 py-3">
      <Link
        to={`/product/${line.slug}`}
        onClick={onNavigate}
        className={cn('shrink-0 overflow-hidden rounded-md bg-bg-elevated', compact ? 'size-16' : 'size-20')}
      >
        {line.image ? (
          <img src={line.image} alt={line.name} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground"><ImageOff className="size-5" /></div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${line.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-medium text-foreground hover:text-gold-base">
            {line.name}
          </Link>
          <button onClick={() => onRemove(line)} aria-label="Remove" className="shrink-0 text-muted-foreground hover:text-error">
            <Trash2 className="size-4" />
          </button>
        </div>
        {variantLabel && <p className="text-xs text-muted-foreground">{variantLabel}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => (line.quantity <= 1 ? onRemove(line) : onQty(line, line.quantity - 1))}
              className="grid size-8 place-items-center text-foreground"
              aria-label="Decrease"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
            <button
              onClick={() => onQty(line, line.quantity + 1)}
              disabled={line.quantity >= line.maxStock}
              className="grid size-8 place-items-center text-foreground disabled:opacity-40"
              aria-label="Increase"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="font-display text-sm font-semibold text-gold-base tabular-nums">
            {formatPrice(line.lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
