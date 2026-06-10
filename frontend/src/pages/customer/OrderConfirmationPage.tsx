import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Package, MailCheck } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getOrder } from '@/lib/api/order.api';
import { Button } from '@/components/ui/button';

const CONFETTI_COLORS = ['#E4A93A', '#6C3ABF', '#0F4F4F', '#2ECC71'];

function Confetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-96 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (Math.random() * 2 - 1) * 340;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-20 size-2 rounded-[2px]"
            style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x, y: 360 + Math.random() * 220, rotate: Math.random() * 540, opacity: 0 }}
            transition={{ duration: 1.6 + Math.random(), delay: Math.random() * 0.3, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function SuccessCheck() {
  return (
    <motion.svg viewBox="0 0 64 64" className="size-20" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
      <motion.circle
        cx="32" cy="32" r="29" fill="none" stroke="#E4A93A" strokeWidth="3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.path
        d="M20 33 L29 42 L45 24" fill="none" stroke="#E4A93A" strokeWidth="5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    document.title = `Order Confirmed · ${APP_NAME}`;
  }, []);

  if (isLoading) {
    return <div className="container py-20"><div className="skeleton mx-auto h-72 max-w-lg rounded-xl" /></div>;
  }
  if (isError || !order) {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Order not found</h1>
        <Link to="/" className="mt-3 inline-block text-gold-base hover:underline">Back to home</Link>
      </div>
    );
  }

  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 5);

  return (
    <div className="relative">
      <Confetti />
      <div className="container relative z-10 flex flex-col items-center py-16">
        <SuccessCheck />
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 font-display text-2xl font-bold text-foreground md:text-3xl"
        >
          Order Placed Successfully!
        </motion.h1>
        <p className="mt-2 text-muted-foreground">Thank you for shopping with IndusAI.</p>

        <div className="mt-8 w-full max-w-lg rounded-xl border border-border bg-bg-surface p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs text-muted-foreground">Order Number</p>
              <p className="font-display text-lg font-semibold text-gold-base">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Estimated Delivery</p>
              <p className="text-sm font-medium text-foreground">{formatDate(eta)}</p>
            </div>
          </div>

          <ul className="space-y-3 py-4">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <span className="size-12 shrink-0 overflow-hidden rounded-md bg-bg-elevated">
                  {it.product.image && <img src={it.product.image} alt="" className="size-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">{it.product.name}</span>
                  <span className="text-xs text-muted-foreground">Qty {it.quantity}</span>
                </span>
                <span className="text-sm tabular-nums text-foreground">{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total ({order.payment?.method})</span>
            <span className="font-display text-lg font-semibold text-gold-base">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to={`/account/orders/${order.id}`}><Package /> Track Your Order</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MailCheck className="size-4 text-gold-base" /> A confirmation email is on its way.
        </p>
      </div>
    </div>
  );
}
