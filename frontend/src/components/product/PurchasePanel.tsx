import { Minus, Plus, ShoppingCart, Heart, ShieldCheck, RotateCcw, BadgeCheck, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface PurchasePanelProps {
  maxStock: number;
  inStock: boolean;
  quantity: number;
  setQuantity: (n: number) => void;
  onAddToCart: () => void;
  onWishlist: () => void;
  adding: boolean;
  needsVariant: boolean;
}

export function PurchasePanel({
  maxStock,
  inStock,
  quantity,
  setQuantity,
  onAddToCart,
  onWishlist,
  adding,
  needsVariant,
}: PurchasePanelProps) {
  const clamp = (n: number) => Math.max(1, Math.min(n, Math.max(1, maxStock)));

  return (
    <div className="space-y-5">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQuantity(clamp(quantity - 1))}
            disabled={quantity <= 1}
            className="grid size-10 place-items-center text-foreground disabled:opacity-40"
            aria-label="Decrease"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(clamp(quantity + 1))}
            disabled={quantity >= maxStock}
            className="grid size-10 place-items-center text-foreground disabled:opacity-40"
            aria-label="Increase"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {inStock && maxStock <= 5 && (
          <span className="text-xs text-warning">Only {maxStock} left</span>
        )}
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="h-13 w-full text-base"
          onClick={onAddToCart}
          disabled={!inStock || adding}
        >
          <ShoppingCart />
          {!inStock ? 'Out of Stock' : adding ? 'Adding…' : needsVariant ? 'Select options' : 'Add to Cart'}
        </Button>
        <Button size="lg" variant="outline" className="h-12 w-full" onClick={onWishlist}>
          <Heart /> Add to Wishlist
        </Button>
      </div>

      {/* Delivery */}
      <div className="space-y-1.5 rounded-lg border border-border bg-bg-surface p-4 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Truck className="size-4 text-gold-base" /> Free delivery on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <BadgeCheck className="size-4 text-gold-base" /> Cash on Delivery available
        </p>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
        {[
          { icon: ShieldCheck, label: 'Secure Checkout' },
          { icon: RotateCcw, label: 'Easy Returns' },
          { icon: BadgeCheck, label: 'Authentic' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className={cn('flex flex-col items-center gap-1 rounded-md border border-border py-3')}>
            <Icon className="size-5 text-gold-base" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
