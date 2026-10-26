import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { AtelierLayout } from '../components/atelier/layout';
import { formatPrice, pageHead } from '../lib/collection';
import { shopifyProductsQuery, productForPiece } from '../lib/shopify';
import { useCartStore } from '../stores/cart-store';
import { submitEft } from '../lib/eft.functions';
import { eftSchema, deliveryFee } from '../lib/eft-schema';

export const Route = createFileRoute('/checkout')({
  loader: ({ context }) => context.queryClient.ensureQueryData(shopifyProductsQuery),
  validateSearch: (s: Record<string, unknown>): { piece?: string } => typeof s['piece'] === 'string' ? { piece: s['piece'] } : {},
  head: () => pageHead('Absa EFT Checkout', 'Place your E\'SHOE ATELIER order by Absa bank transfer with a unique payment reference and invoice.', '/checkout'),
  component: Checkout,
});
function Checkout() {
  const { data: products } = useSuspenseQuery(shopifyProductsQuery);
  const { piece } = Route.useSearch(); const bag = useCartStore(s => s.items);
  const [hydrated, setHydrated] = useState(false); const [selected, setSelected] = useState(''); const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1); const [delivery, setDelivery] = useState<'collection' | 'delivery'>('collection');
  const [deliveryService, setDeliveryService] = useState<'standard' | 'express'>('standard');
  const [contact, setContact] = useState({ name: '', email: '', phone: '', address: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [eventId, setEventId] = useState('');
  const [result, setResult] = useState<Extract<Awaited<ReturnType<typeof submitEft>>, { ok: true }>['order'] | null>(null);
  const send = useServerFn(submitEft);
  useEffect(() => { setHydrated(true); setSelected(productForPiece(products, piece ?? '')?.id ?? products[0]?.id ?? ''); }, [piece, products]);
  const product = products.find(p => p.id === selected); const variant = product?.variants.find(v => v.id === size);
  const items = hydrated && bag.length ? bag.map(i => ({ variantId: i.variantId, quantity: i.quantity })) : variant ? [{ variantId: variant.id, quantity }] : [];
  const selectionKey = JSON.stringify(items);
  useEffect(() => setEventId(''), [selectionKey]);
  const rows = items.map(i => { const p = products.find(p => p.variants.some(v => v.id === i.variantId)); const v = p?.variants.find(v => v.id === i.variantId); return { ...i, title: p?.title ?? 'Unavailable shoe', size: v?.title ?? '', amount: Number(v?.price.amount ?? 0) }; });
  const subtotal = rows.reduce((sum, i) => sum + i.amount * i.quantity, 0);
  const fee = deliveryFee(delivery, deliveryService);
  const total = subtotal + fee;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return; const id = eventId || crypto.randomUUID(); setEventId(id);
    const parsed = eftSchema.safeParse({ submissionId: id, lines: items, delivery, deliveryService, contact });
    if (!parsed.success) { setError('Choose your shoe and size, and complete your contact and delivery details. Each shoe is limited to five pairs.'); return; }
    setBusy(true); setError('');
    try { const response = await send({ data: parsed.data }); if (response.ok) setResult(response.order); else setError(response.message); }
    catch { setError('Your order could not be completed. Please try again.'); } finally { setBusy(false); }
  }
  return <AtelierLayout><section className="checkout"><span className="eyebrow">ABSA BANK TRANSFER</span><h1>{result ? 'Your EFT order' : 'EFT checkout'}</h1>{result ? <div className="max-w-2xl space-y-5"><h2 className="break-all">{result.orderNo}</h2><p role="status">{result.status === 'paid' ? 'Paid' : 'Awaiting Payment Verification'}</p><p>Delivery: {formatPrice(result.deliveryFee)}</p><p>Total payable: <strong>{formatPrice(result.total)}</strong></p><dl className="grid grid-cols-2 gap-3"><dt>Bank</dt><dd>{result.bank.bank}</dd><dt>Account holder</dt><dd>{result.bank.accountHolder}</dd><dt>Account type</dt><dd>{result.bank.accountType}</dd><dt>Account number</dt><dd>{result.bank.accountNumber}</dd><dt>Branch code</dt><dd>{result.bank.branchCode}</dd><dt>SWIFT</dt><dd>{result.bank.swiftCode}</dd></dl><p className="break-all">Payment reference: <strong>{result.orderNo}</strong></p><p>{result.customerSent ? `Payment instructions sent to ${contact.email}.` : 'Your order is saved, but email delivery was not accepted. Download your invoice below.'}</p><p>Only cleared funds checked by our team confirm payment. This request does not reserve stock.</p><div className="flex flex-wrap gap-3"><Button asChild><a href={result.documentUrl} referrerPolicy="no-referrer">Download PDF invoice</a></Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(result.orderNo).catch(() => setError('Please copy the reference manually.')); }}>Copy reference</Button><Button asChild variant="outline"><Link to="/collection">Continue shopping</Link></Button></div>{error && <p role="alert">{error}</p>}</div> : <form onSubmit={submit} className="checkout-grid"><div className="fields">{(!hydrated || bag.length === 0) && <><label className="field">Shoe<select value={selected} onChange={e => { setSelected(e.target.value); setSize(''); setEventId(''); }}>{products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label className="field">Size<select required value={size} onChange={e => { setSize(e.target.value); setEventId(''); }}><option value="">Choose size</option>{product?.variants.filter(v => v.availableForSale).map(v => <option value={v.id} key={v.id}>{v.title} · {formatPrice(Number(v.price.amount))}</option>)}</select></label><label className="field">Pairs<input type="number" min={1} max={5} value={quantity} onChange={e => { setQuantity(Number(e.target.value)); setEventId(''); }} /></label></>}<label className="field">Delivery<select value={delivery} onChange={e => { setDelivery(e.target.value === 'delivery' ? 'delivery' : 'collection'); setEventId(''); }}><option value="collection">Collection by arrangement</option><option value="delivery">Delivery</option></select></label>{delivery === 'delivery' && <label className="field">Delivery speed<select value={deliveryService} onChange={e => { setDeliveryService(e.target.value === 'express' ? 'express' : 'standard'); setEventId(''); }}><option value="standard">Standard delivery — R150</option><option value="express">Express delivery (1–3 days) — R250</option></select></label>}{(['name', 'email', 'phone'] as const).map(key => <label className="field" key={key}>{key === 'name' ? 'Full name' : key === 'email' ? 'Email' : 'Phone'}<input required type={key === 'email' ? 'email' : 'text'} maxLength={key === 'name' ? 100 : key === 'phone' ? 40 : 254} value={contact[key]} onChange={e => { setContact({ ...contact, [key]: e.target.value }); setEventId(''); }} /></label>)}{delivery === 'delivery' && <label className="field">Delivery address<textarea required maxLength={1000} value={contact.address} onChange={e => { setContact({ ...contact, address: e.target.value }); setEventId(''); }} /></label>}<p className="text-sm">Your contact details are used to process this order and arrange fulfilment. Payment remains unconfirmed until cleared funds are independently checked.</p>{error && <p role="alert" className="checkout-error">{error}</p>}<Button disabled={busy || !items.length || total <= 0} type="submit">{busy ? 'Saving your order…' : 'Place EFT order'}</Button></div><aside className="checkout-summary space-y-4"><h2>Order summary</h2>{rows.map(r => <div key={r.variantId}><p>{r.quantity} × {r.title}</p><p>{r.size} · {formatPrice(r.amount * r.quantity)}</p></div>)}<p>Goods subtotal: <strong>{formatPrice(subtotal)}</strong></p><p>{delivery === 'collection' ? 'Collection' : deliveryService === 'express' ? 'Express delivery (1–3 days)' : 'Standard delivery'}: {formatPrice(fee)}</p><p>Total payable: <strong>{formatPrice(total)}</strong></p><p>Absa EFT · ZAR</p></aside></form>}</section></AtelierLayout>;
}