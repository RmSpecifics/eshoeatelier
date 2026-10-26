import { useEffect, useState } from 'react';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '../../stores/cart-store';
import { Link } from '@tanstack/react-router';

const rand = (n: number) => `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function useCartSync() {
  const syncCart = useCartStore(s => s.syncCart);
  useEffect(() => {
    syncCart();
    const onVisible = () => { if (document.visibilityState === 'visible') syncCart(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [syncCart]);
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, syncCart } = useCartStore();
  useEffect(() => setMounted(true), []);
  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);
  const count = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><Button variant="ghost" size="icon" className="cart-trigger" aria-label={`Shopping bag, ${count} items`}><ShoppingBag />{count > 0 && <span className="cart-count">{count}</span>}</Button></SheetTrigger>
    <SheetContent className="cart-sheet flex flex-col w-full sm:max-w-md">
      <SheetHeader><SheetTitle className="font-editorial text-3xl">Your bag</SheetTitle><SheetDescription>{count === 0 ? 'Your bag is empty.' : `${count} item${count === 1 ? '' : 's'}`}</SheetDescription></SheetHeader>
      {items.length > 0 && <>
        <div className="flex-1 overflow-y-auto space-y-5 py-4">{items.map(item => <div key={item.variantId} className="cart-line">
          <img src={item.image} alt={item.title} />
          <div className="flex-1 min-w-0"><h4 className="font-editorial text-lg truncate">{item.title}</h4><p className="text-sm text-muted-foreground">{item.size}</p><p className="product-price">{rand(parseFloat(item.price.amount))}</p></div>
          <div className="flex flex-col items-end gap-2">
            <Button variant="ghost" size="icon" aria-label={`Remove ${item.title}`} onClick={() => removeItem(item.variantId)}><Trash2 size={14} /></Button>
            <div className="flex items-center gap-1"><Button variant="outline" size="icon" className="h-7 w-7" aria-label="Decrease quantity" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus size={12} /></Button><span className="w-7 text-center text-sm">{item.quantity}</span><Button variant="outline" size="icon" className="h-7 w-7" aria-label="Increase quantity" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus size={12} /></Button></div>
          </div>
        </div>)}</div>
        <div className="border-t pt-4 space-y-4"><div className="flex justify-between items-baseline"><span className="eyebrow">Total</span><span className="product-price">{rand(total)}</span></div><p className="text-xs text-muted-foreground">Standard delivery R150 · Express (1–3 days) R250.</p><Button asChild variant="outline" className="w-full" disabled={isLoading || isSyncing}><Link to="/checkout" onClick={() => setOpen(false)}>Pay by Absa EFT</Link></Button></div>
      </>}
    </SheetContent>
  </Sheet>;
}
