import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

/** A guest cart line — persisted to localStorage until the user logs in. */
export interface GuestCartLine {
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

interface CartUIState {
  // Guest cart (used only when not authenticated)
  guestItems: GuestCartLine[];
  addGuestItem: (line: GuestCartLine) => void;
  setGuestQty: (productId: string, variantId: string | null, quantity: number) => void;
  removeGuestItem: (productId: string, variantId: string | null) => void;
  clearGuest: () => void;

  // Cart drawer open/close (UI built in Phase 5.1)
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const sameLine = (a: GuestCartLine, productId: string, variantId: string | null) =>
  a.productId === productId && a.variantId === variantId;

export const useCartStore = create<CartUIState>()(
  persist(
    (set) => ({
      guestItems: [],
      addGuestItem: (line) =>
        set((state) => {
          const existing = state.guestItems.find((i) => sameLine(i, line.productId, line.variantId));
          if (existing) {
            return {
              guestItems: state.guestItems.map((i) =>
                sameLine(i, line.productId, line.variantId)
                  ? { ...i, quantity: Math.min(i.quantity + line.quantity, line.maxStock) }
                  : i,
              ),
            };
          }
          return { guestItems: [...state.guestItems, line] };
        }),
      setGuestQty: (productId, variantId, quantity) =>
        set((state) => ({
          guestItems:
            quantity <= 0
              ? state.guestItems.filter((i) => !sameLine(i, productId, variantId))
              : state.guestItems.map((i) =>
                  sameLine(i, productId, variantId)
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i,
                ),
        })),
      removeGuestItem: (productId, variantId) =>
        set((state) => ({
          guestItems: state.guestItems.filter((i) => !sameLine(i, productId, variantId)),
        })),
      clearGuest: () => set({ guestItems: [] }),

      isOpen: false,
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: STORAGE_KEYS.cart,
      partialize: (state) => ({ guestItems: state.guestItems }),
    },
  ),
);
