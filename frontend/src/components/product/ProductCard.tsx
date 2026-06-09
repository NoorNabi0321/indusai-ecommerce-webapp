import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import { cn, cssColor } from '@/lib/utils';
import type { Product } from '@/types/product.types';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist } from '@/lib/api/wishlist.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { StarRating } from '@/components/common/StarRating';
import { PriceDisplay } from '@/components/common/PriceDisplay';

interface ProductCardProps {
  product: Product;
  className?: string;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, className, layout = 'grid' }: ProductCardProps) {
  const isList = layout === 'list';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [savingDisabled, setSavingDisabled] = useState(false);

  const images = product.images ?? [];
  const mainImage = images.find((i) => i.isMain)?.url ?? images[0]?.url ?? null;
  const hoverImage = images.find((i) => i.url !== mainImage)?.url ?? null;

  const stats = product.reviewStats ?? { average: 0, count: 0 };
  const onSale = product.comparePrice != null && product.comparePrice > product.basePrice;
  const totalStock = (product.variants ?? []).reduce((s, v) => s + v.stock, 0);
  const lowStock = product.variants && product.variants.length > 0 && totalStock > 0 && totalStock <= 5;

  const colors = Array.from(
    new Set((product.variants ?? []).map((v) => v.color).filter(Boolean) as string[]),
  ).slice(0, 4);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Sign in to save items to your wishlist.');
      navigate('/auth/login');
      return;
    }
    if (savingDisabled) return;
    setSavingDisabled(true);
    try {
      await addToWishlist(product.id);
      setSaved(true);
      toast.success('Added to your wishlist.');
    } catch (error) {
      toast.error(getApiError(error).message);
    } finally {
      setSavingDisabled(false);
    }
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        'group relative flex overflow-hidden rounded-lg border border-border bg-bg-surface transition-all duration-300 hover:border-bg-overlay hover:shadow-elev-2',
        isList ? 'flex-row' : 'flex-col hover:-translate-y-1',
        className,
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative aspect-square overflow-hidden bg-bg-elevated',
          isList && 'w-32 shrink-0 sm:w-44',
        )}
      >
        {mainImage ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className={cn(
                'absolute inset-0 size-full object-cover transition-opacity duration-300',
                hoverImage && 'group-hover:opacity-0',
              )}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale && (
            <span className="rounded-sm bg-success px-1.5 py-0.5 text-xs font-semibold text-bg-base">
              Sale
            </span>
          )}
          {lowStock && (
            <span className="rounded-sm bg-warning px-1.5 py-0.5 text-xs font-semibold text-bg-base">
              Low Stock
            </span>
          )}
          {totalStock === 0 && product.variants && product.variants.length > 0 && (
            <span className="rounded-sm bg-error px-1.5 py-0.5 text-xs font-semibold text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleSave}
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-bg-base/70 text-foreground backdrop-blur transition-colors hover:bg-bg-base"
        >
          <Heart className={cn('size-4', saved && 'fill-gold-base text-gold-base')} />
        </button>
      </div>

      {/* Body */}
      <div className={cn('flex flex-1 flex-col gap-1.5 p-3', isList && 'justify-center')}>
        {product.brand && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
        <StarRating value={stats.average} count={stats.count} />
        <PriceDisplay basePrice={product.basePrice} comparePrice={product.comparePrice} />
        {colors.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            {colors.map((c) => (
              <span
                key={c}
                title={c}
                className="size-3 rounded-full border border-white/20"
                style={{ backgroundColor: cssColor(c) }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
