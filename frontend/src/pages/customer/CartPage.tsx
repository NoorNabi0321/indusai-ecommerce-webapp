import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useCart, type DisplayCartLine } from '@/hooks/useCart';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, count, subtotal, setQty, removeItem, isLoading } = useCart();

  useEffect(() => {
    document.title = `Cart · ${APP_NAME}`;
  }, []);

  const onQty = (line: DisplayCartLine, qty: number) =>
    setQty(line, qty).catch((e) => toast.error(getApiError(e).message));
  const onRemove = (line: DisplayCartLine) =>
    removeItem(line).catch((e) => toast.error(getApiError(e).message));

  if (isLoading) {
    return <div className="container py-10"><div className="skeleton h-64 rounded-xl" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="size-16 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="max-w-sm text-muted-foreground">Looks like you haven't added anything yet.</p>
        <Button asChild size="lg"><Link to="/shop/shirts">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">
        Your Cart <span className="text-muted-foreground">({count} items)</span>
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="divide-y divide-border rounded-xl border border-border bg-bg-surface px-5">
            {items.map((line) => (
              <CartLineItem key={line.key} line={line} onQty={onQty} onRemove={onRemove} />
            ))}
          </div>
          <Link to="/shop/shirts" className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
            <ArrowLeft className="size-4" /> Continue shopping
          </Link>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <OrderSummary subtotal={subtotal}>
            <Button className="mt-4 w-full" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              Visa · Mastercard · JazzCash · Easypaisa · COD
            </div>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
