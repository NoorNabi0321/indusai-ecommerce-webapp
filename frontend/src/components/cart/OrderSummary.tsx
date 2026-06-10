import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

export const STANDARD_SHIPPING = 200;

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  children?: React.ReactNode;
}

export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING;
}

export function OrderSummary({ subtotal, discount = 0, children }: OrderSummaryProps) {
  const shipping = computeShipping(subtotal);
  const total = Math.max(0, subtotal - discount) + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <h2 className="mb-4 font-display text-md font-semibold text-foreground">Order Summary</h2>

      {remaining > 0 && subtotal > 0 && (
        <div className="mb-4 rounded-lg bg-bg-elevated p-3">
          <p className="text-xs text-muted-foreground">
            You're <span className="font-medium text-gold-base">{formatPrice(remaining)}</span> away from free shipping
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-overlay">
            <div className="h-full rounded-full bg-gold-base transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums text-foreground">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums text-success">−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums text-foreground">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-3">
          <dt className="font-medium text-foreground">Total</dt>
          <dd className="font-display text-lg font-semibold text-gold-base">{formatPrice(total)}</dd>
        </div>
      </dl>

      {children}
    </div>
  );
}
