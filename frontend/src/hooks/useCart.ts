import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCartStore } from '@/stores/cartStore';
import {
  getCart,
  setCartItem,
  removeCartItem as apiRemove,
  clearCart as apiClear,
} from '@/lib/api/cart.api';

export interface DisplayCartLine {
  key: string;
  serverId?: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  name: string;
  slug: string;
  image: string | null;
  size: string | null;
  color: string | null;
  maxStock: number;
}

export interface AddToCartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  size: string | null;
  color: string | null;
  maxStock: number;
}

/** Unified cart: server-backed when authenticated, localStorage guest cart otherwise. */
export function useCart() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const guestItems = useCartStore((s) => s.guestItems);
  const addGuest = useCartStore((s) => s.addGuestItem);
  const setGuestQty = useCartStore((s) => s.setGuestQty);
  const removeGuest = useCartStore((s) => s.removeGuestItem);
  const clearGuest = useCartStore((s) => s.clearGuest);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 10_000,
  });

  const items: DisplayCartLine[] = isAuthenticated
    ? (cartQuery.data?.items ?? []).map((i) => ({
        key: i.id,
        serverId: i.id,
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal,
        name: i.product.name,
        slug: i.product.slug,
        image: i.product.image,
        size: i.variant?.size ?? null,
        color: i.variant?.color ?? null,
        maxStock: i.variant?.stock ?? 99,
      }))
    : guestItems.map((i) => ({
        key: `${i.productId}:${i.variantId}`,
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.unitPrice * i.quantity,
        name: i.name,
        slug: i.slug,
        image: i.image,
        size: i.size,
        color: i.color,
        maxStock: i.maxStock,
      }));

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  async function addToCart(line: AddToCartLine) {
    if (isAuthenticated) {
      const existing = items.find(
        (i) => i.productId === line.productId && i.variantId === line.variantId,
      );
      const newQty = Math.min((existing?.quantity ?? 0) + line.quantity, line.maxStock);
      await setCartItem({ productId: line.productId, variantId: line.variantId, quantity: newQty });
      await qc.invalidateQueries({ queryKey: ['cart'] });
    } else {
      addGuest(line);
    }
  }

  async function setQty(line: DisplayCartLine, quantity: number) {
    if (isAuthenticated) {
      await setCartItem({ productId: line.productId, variantId: line.variantId, quantity });
      await qc.invalidateQueries({ queryKey: ['cart'] });
    } else {
      setGuestQty(line.productId, line.variantId, quantity);
    }
  }

  async function removeItem(line: DisplayCartLine) {
    if (isAuthenticated && line.serverId) {
      await apiRemove(line.serverId);
      await qc.invalidateQueries({ queryKey: ['cart'] });
    } else {
      removeGuest(line.productId, line.variantId);
    }
  }

  async function clear() {
    if (isAuthenticated) {
      await apiClear();
      await qc.invalidateQueries({ queryKey: ['cart'] });
    } else {
      clearGuest();
    }
  }

  return {
    items,
    count,
    subtotal,
    isLoading: isAuthenticated && cartQuery.isLoading,
    addToCart,
    setQty,
    removeItem,
    clear,
  };
}
