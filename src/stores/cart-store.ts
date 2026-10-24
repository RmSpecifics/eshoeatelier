import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { addLineToShopifyCart, createShopifyCart, fetchCartQuantity, removeLineFromShopifyCart, ShopifyPaymentRequired, updateShopifyCartLine, type Money } from '../lib/shopify';

export type CartItem = { lineId: string | null; variantId: string; title: string; size: string; image: string; price: Money; quantity: number };

type CartStore = {
  items: CartItem[]; cartId: string | null; checkoutUrl: string | null; isLoading: boolean; isSyncing: boolean;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
};

function reportError(error: unknown) {
  console.error(error);
  if (error instanceof ShopifyPaymentRequired) toast.error('Checkout is not open yet', { description: 'The store needs an active Shopify plan before it can take orders.' });
  else toast.error('Something went wrong with your bag. Please try again.');
}

export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false,
  addItem: async item => {
    const { items, cartId, clearCart } = get();
    const existing = items.find(i => i.variantId === item.variantId);
    set({ isLoading: true });
    try {
      if (!cartId) {
        const r = await createShopifyCart(item.variantId, item.quantity);
        if (!r) return false;
        set({ cartId: r.cartId, checkoutUrl: r.checkoutUrl, items: [{ ...item, lineId: r.lineId }] });
        return true;
      }
      if (existing?.lineId) {
        const qty = existing.quantity + item.quantity;
        const r = await updateShopifyCartLine(cartId, existing.lineId, qty);
        if (r.cartNotFound) { clearCart(); return get().addItem(item); }
        if (r.success) set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: qty } : i) });
        return r.success;
      }
      const r = await addLineToShopifyCart(cartId, item.variantId, item.quantity);
      if (r.cartNotFound) { clearCart(); return get().addItem(item); }
      if (r.success) set({ items: [...get().items, { ...item, lineId: r.lineId ?? null }] });
      return r.success;
    } catch (e) { reportError(e); return false; } finally { set({ isLoading: false }); }
  },
  updateQuantity: async (variantId, quantity) => {
    if (quantity <= 0) return get().removeItem(variantId);
    const { items, cartId, clearCart } = get();
    const item = items.find(i => i.variantId === variantId);
    if (!item?.lineId || !cartId) return;
    set({ isLoading: true });
    try {
      const r = await updateShopifyCartLine(cartId, item.lineId, quantity);
      if (r.success) set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
      else if (r.cartNotFound) clearCart();
    } catch (e) { reportError(e); } finally { set({ isLoading: false }); }
  },
  removeItem: async variantId => {
    const { items, cartId, clearCart } = get();
    const item = items.find(i => i.variantId === variantId);
    if (!item?.lineId || !cartId) return;
    set({ isLoading: true });
    try {
      const r = await removeLineFromShopifyCart(cartId, item.lineId);
      if (r.success) { const next = get().items.filter(i => i.variantId !== variantId); next.length ? set({ items: next }) : clearCart(); }
      else if (r.cartNotFound) clearCart();
    } catch (e) { reportError(e); } finally { set({ isLoading: false }); }
  },
  clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
  syncCart: async () => {
    const { cartId, isSyncing, clearCart } = get();
    if (!cartId || isSyncing) return;
    set({ isSyncing: true });
    try { if ((await fetchCartQuantity(cartId)) === 0) clearCart(); }
    catch (e) { console.error('Cart sync failed', e); } finally { set({ isSyncing: false }); }
  },
}), { name: 'atelier-shopify-cart', storage: createJSONStorage(() => localStorage), partialize: s => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }) }));
