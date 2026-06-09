import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StickyCartBarProps {
  visible: boolean;
  name: string;
  image: string | null;
  price: number;
  inStock: boolean;
  adding: boolean;
  onAddToCart: () => void;
}

export function StickyCartBar({ visible, name, image, price, inStock, adding, onAddToCart }: StickyCartBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10"
        >
          <div className="container flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {image && <img src={image} alt="" className="size-11 shrink-0 rounded-md object-cover" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                <p className="font-display text-md font-semibold text-gold-base">{formatPrice(price)}</p>
              </div>
            </div>
            <Button onClick={onAddToCart} disabled={!inStock || adding} className="shrink-0">
              <ShoppingCart /> {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
