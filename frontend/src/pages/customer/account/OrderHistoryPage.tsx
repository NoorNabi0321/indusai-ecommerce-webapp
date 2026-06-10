import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, ImageOff } from 'lucide-react';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { listOrders } from '@/lib/api/order.api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';

const FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function OrderHistoryPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');

  useEffect(() => {
    document.title = `My Orders · ${APP_NAME}`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', filter],
    queryFn: () => listOrders({ status: filter === 'ALL' ? undefined : filter, limit: 20 }),
  });

  const orders = data?.items ?? [];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Order History</h2>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              filter === f ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-surface py-20 text-center">
          <Package className="size-12 text-muted-foreground" />
          <h3 className="font-display text-md font-semibold text-foreground">No orders yet</h3>
          <p className="text-sm text-muted-foreground">When you place an order, it'll show up here.</p>
          <Button asChild><Link to="/shop/shirts">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block rounded-xl border border-border bg-bg-surface p-4 transition-colors hover:border-bg-overlay"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex -space-x-2">
                  {order.thumbnails.length > 0 ? (
                    order.thumbnails.map((url, i) => (
                      <span key={i} className="size-10 overflow-hidden rounded-md border-2 border-bg-surface bg-bg-elevated">
                        <img src={url} alt="" className="size-full object-cover" />
                      </span>
                    ))
                  ) : (
                    <span className="grid size-10 place-items-center rounded-md bg-bg-elevated text-muted-foreground"><ImageOff className="size-4" /></span>
                  )}
                  <span className="ml-4 self-center text-xs text-muted-foreground">
                    {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-semibold text-gold-base">{formatPrice(order.total)}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
