import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Cog, Truck, CheckCircle2, ChevronLeft, Download, RotateCcw, MessageCircle, XCircle } from 'lucide-react';
import { cn, formatPrice, formatDateTime } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getOrder } from '@/lib/api/order.api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

const TIMELINE = [
  { status: 'PENDING', label: 'Order Placed', icon: Package },
  { status: 'PROCESSING', label: 'Processing', icon: Cog },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
] as const;

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    document.title = `Order · ${APP_NAME}`;
  }, []);

  if (isLoading) return <div className="skeleton h-96 rounded-xl" />;
  if (isError || !order) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Order not found</h2>
        <Link to="/account/orders" className="mt-2 inline-block text-gold-base hover:underline">Back to orders</Link>
      </div>
    );
  }

  const cancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const currentIndex = TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <div>
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
        <ChevronLeft className="size-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <section className="mb-6 rounded-xl border border-border bg-bg-surface p-6">
        {cancelled ? (
          <div className="flex items-center gap-3 text-error">
            <XCircle className="size-6" />
            <p className="text-sm">This order was {order.status.toLowerCase()}.</p>
          </div>
        ) : (
          <ol className="relative space-y-6">
            {TIMELINE.map((step, i) => {
              const done = i <= currentIndex;
              const active = i === currentIndex;
              return (
                <li key={step.status} className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <span className={cn(
                      'grid size-9 place-items-center rounded-full border-2 transition-colors',
                      done ? 'border-gold-base bg-gold-base/10 text-gold-base' : 'border-border text-muted-foreground',
                      active && 'ring-4 ring-gold-base/20',
                    )}>
                      <step.icon className="size-4" />
                    </span>
                    {i < TIMELINE.length - 1 && (
                      <span className={cn('absolute top-9 h-6 w-0.5', i < currentIndex ? 'bg-gold-base' : 'bg-border')} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={cn('text-sm font-medium', done ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</p>
                    {active && <p className="text-xs text-gold-base">In progress</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Items */}
        <section className="rounded-xl border border-border bg-bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Items</h3>
          <ul className="divide-y divide-border">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <Link to={`/product/${it.product.slug}`} className="size-14 shrink-0 overflow-hidden rounded-md bg-bg-elevated">
                  {it.product.image && <img src={it.product.image} alt="" className="size-full object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${it.product.slug}`} className="block truncate text-sm font-medium text-foreground hover:text-gold-base">
                    {it.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {[it.variant?.color, it.variant?.size].filter(Boolean).join(' · ')} {it.variant ? '·' : ''} Qty {it.quantity}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-foreground">{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2"><dt className="font-medium text-foreground">Total</dt><dd className="font-display font-semibold text-gold-base">{formatPrice(order.total)}</dd></div>
          </dl>
        </section>

        {/* Side: delivery + actions */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Delivery Address</h3>
            <p className="text-sm text-foreground">{order.address.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}</p>
            <p className="text-sm text-muted-foreground">{order.address.phone}</p>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Payment</h3>
            <p className="text-sm text-muted-foreground">{order.payment?.method} · {order.payment?.status}</p>
          </section>

          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => toast.info('Invoice download is coming soon.')}>
              <Download className="size-4" /> Download Invoice
            </Button>
            {order.status === 'DELIVERED' && (
              <Button asChild variant="outline" className="w-full">
                <Link to={`/account/returns/new?orderId=${order.id}`}><RotateCcw className="size-4" /> Request Return</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link to="/support"><MessageCircle className="size-4" /> Contact Support</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
