import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { getWishlist, removeFromWishlist } from '@/lib/api/wishlist.api';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';

export default function WishlistPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: items, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: getWishlist });

  useEffect(() => {
    document.title = `Wishlist · ${APP_NAME}`;
  }, []);

  const remove = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (data) => {
      qc.setQueryData(['wishlist'], data);
      toast.success('Removed from wishlist.');
    },
    onError: (e) => toast.error(getApiError(e).message),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-bg-surface py-20 text-center">
        <Heart className="size-12 text-muted-foreground" />
        <h2 className="font-display text-lg font-semibold text-foreground">Your wishlist is empty</h2>
        <p className="max-w-sm text-sm text-muted-foreground">Save items you love and find them here later.</p>
        <Button asChild><Link to="/shop/shirts">Start shopping</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
        Wishlist <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-bg-surface">
            <Link to={`/product/${item.product.slug}`} className="relative block aspect-square overflow-hidden bg-bg-elevated">
              {item.product.image && (
                <img src={item.product.image} alt={item.product.name} className="size-full object-cover" />
              )}
            </Link>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <Link to={`/product/${item.product.slug}`} className="line-clamp-2 text-sm font-medium text-foreground hover:text-gold-base">
                {item.product.name}
              </Link>
              <PriceDisplay basePrice={item.product.basePrice} comparePrice={item.product.comparePrice} />
              <div className="mt-auto flex gap-2 pt-1">
                <Button size="sm" className="flex-1" onClick={() => navigate(`/product/${item.product.slug}`)}>
                  <ShoppingCart className="size-4" /> Move to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove.mutate(item.productId)}
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
