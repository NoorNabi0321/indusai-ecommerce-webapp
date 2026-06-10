import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useCart, type DisplayCartLine } from '@/hooks/useCart';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { CartLineItem } from './CartLineItem';

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const navigate = useNavigate();
  const { items, count, subtotal, setQty, removeItem } = useCart();

  const onQty = (line: DisplayCartLine, qty: number) =>
    setQty(line, qty).catch((e) => toast.error(getApiError(e).message));
  const onRemove = (line: DisplayCartLine) =>
    removeItem(line).catch((e) => toast.error(getApiError(e).message));

  const close = () => setOpen(false);
  const go = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-bg-base shadow-elev-4"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-md font-semibold text-foreground">
                Your Cart {count > 0 && <span className="text-muted-foreground">({count})</span>}
              </h2>
              <button onClick={close} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <ShoppingBag className="size-12 text-muted-foreground" />
                <p className="font-display text-md font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add some products to get started.</p>
                <Button onClick={() => go('/shop/shirts')}>Start Shopping</Button>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-border overflow-y-auto px-5">
                  {items.map((line) => (
                    <CartLineItem key={line.key} line={line} onQty={onQty} onRemove={onRemove} compact onNavigate={close} />
                  ))}
                </div>

                <footer className="border-t border-border p-5">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-display text-lg font-semibold text-gold-base tabular-nums">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">Shipping &amp; taxes calculated at checkout.</p>
                  <Button className="w-full" size="lg" onClick={() => go('/checkout')}>
                    Proceed to Checkout
                  </Button>
                  <Button variant="ghost" className="mt-2 w-full" onClick={() => go('/cart')}>
                    View Cart
                  </Button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
