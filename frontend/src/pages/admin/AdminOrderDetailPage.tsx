import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, User, Printer } from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import type { OrderStatus } from '@/types/order.types';
import { getOrder, updateOrderStatus } from '@/lib/api/order.api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const qc = useQueryClient();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
  });

  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [tracking, setTracking] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    document.title = `Order · ${APP_NAME} Admin`;
  }, []);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTracking(order.trackingNumber ?? '');
      setNotes(order.internalNotes ?? '');
    }
  }, [order]);

  const mutation = useMutation({
    mutationFn: () => updateOrderStatus(orderId!, { status, trackingNumber: tracking, internalNotes: notes }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['order', orderId] });
      void qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated. Customer notified.');
    },
    onError: (e) => toast.error(getApiError(e).message),
  });

  if (isLoading) return <div className="skeleton h-96 rounded-xl" />;
  if (isError || !order) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Order not found</h2>
        <Link to="/admin/orders" className="mt-2 inline-block text-gold-base hover:underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
        <ChevronLeft className="size-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <Button variant="outline" size="sm" onClick={() => toast.info('Invoice printing is coming soon.')}>
            <Printer className="size-4" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: items */}
        <section className="rounded-xl border border-border bg-bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Items</h3>
          <ul className="divide-y divide-border">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <span className="size-12 shrink-0 overflow-hidden rounded-md bg-bg-elevated">
                  {it.product.image && <img src={it.product.image} alt="" className="size-full object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{it.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[it.variant?.color, it.variant?.size].filter(Boolean).join(' · ')} · Qty {it.quantity}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-foreground">{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2"><dt className="font-medium text-foreground">Total</dt><dd className="font-display font-semibold text-gold-base">{formatPrice(order.total)}</dd></div>
          </dl>
        </section>

        {/* Right: admin controls */}
        <aside className="space-y-4">
          {/* Status updater */}
          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Update Order</h3>
            <label className="mb-1 block text-xs text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="mb-3 h-10 w-full rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none focus:border-gold-dim"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="mb-1 block text-xs text-muted-foreground">Tracking Number</label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. TCS-12345678"
              className="mb-3 h-10 w-full rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none focus:border-gold-dim"
            />

            <label className="mb-1 block text-xs text-muted-foreground">Internal Notes (staff only)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Not visible to the customer"
              className="mb-3 w-full rounded-md border border-input bg-bg-base px-3 py-2 text-sm text-foreground outline-none focus:border-gold-dim"
            />

            <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Update & Notify Customer'}
            </Button>
          </section>

          {/* Customer */}
          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><User className="size-4" /> Customer</h3>
            <p className="text-sm text-foreground">{order.customer?.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
            {order.customer?.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
          </section>

          {/* Delivery + payment */}
          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Delivery</h3>
            <p className="text-sm text-foreground">{order.address.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}</p>
            <p className="mt-2 text-sm text-muted-foreground">Payment: {order.payment?.method} · {order.payment?.status}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
