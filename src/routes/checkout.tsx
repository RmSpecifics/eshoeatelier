import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { submitOrder } from '../lib/orders.functions';
import { orderSchema } from '../lib/order-schema';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AtelierLayout } from '../components/atelier/layout';
import { collection, formatPrice, pageHead, SIZES } from '../lib/collection';

export const Route = createFileRoute('/checkout')({
  validateSearch: (s: Record<string, unknown>) => ({ piece: typeof s['piece'] === 'string' ? s['piece'] : undefined }),
  head: () => pageHead('Checkout', "Select your shoe, size and delivery, then place your order with E'SHOE ATELIER.", '/checkout'),
  component: CheckoutPage,
});

type Delivery = 'delivery' | 'collection';
const STEPS = ['Shoe', 'Size', 'Quantity', 'Delivery', 'Your details', 'Review'];

function CheckoutPage() {
  const search = Route.useSearch();
  const [step, setStep] = useState(search.piece ? 2 : 1);
  const [pieceId, setPieceId] = useState(search.piece ?? collection[0]?.id ?? '');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [delivery, setDelivery] = useState<Delivery>('delivery');
  const [contact, setContact] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [pending, setPending] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const sendOrder = useServerFn(submitOrder);

  const piece = collection.find(p => p.id === pieceId) ?? collection[0];
  if (!piece) return <AtelierLayout><main id="main"><h1>No shoes available</h1></main></AtelierLayout>;
  const subtotal = piece.price === undefined ? undefined : piece.price * qty;

  function next() {
    if (step === 2 && !size) return setError('Please choose a size.');
    if (step === 5) {
      if (!contact.name.trim() || !/^\S+@\S+\.\S+$/.test(contact.email) || !contact.phone.trim()) return setError('Please enter your name, a valid email and phone number.');
      if (delivery === 'delivery' && !contact.address.trim()) return setError('Please enter your delivery address.');
    }
    setError('');
    setStep(s => Math.min(STEPS.length, s + 1));
  }
  async function placeOrder() {
    if (pending) return;
    const eventId = submissionId || crypto.randomUUID();
    setSubmissionId(eventId);
    const parsed = orderSchema.safeParse({ submissionId: eventId, pieceId, size, qty, delivery, contact });
    if (!parsed.success) { setError('Please check your shoe, size and contact details.'); return; }
    setPending(true);
    setError('');
    try {
      const result = await sendOrder({ data: parsed.data });
      if (result.ok) setOrderNo(result.orderNo);
      else setError(result.message);
    } catch {
      setError('Your order could not be sent. Please try again. No payment has been taken.');
    } finally { setPending(false); }
  }

  return (
    <AtelierLayout>
      <main className="checkout" id="main">
        <span className="eyebrow">Checkout</span>
        <h1>{orderNo ? 'Thank you.' : 'Complete your order'}</h1>
        <div className="checkout-grid">
          <div>
            {!orderNo && (
              <ol className="checkout-steps">
                {STEPS.map((s, i) => (
                  <li key={s} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>
                    <span className="dot">{i + 1 < step ? <Check size={13} /> : i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            )}
            <div className="checkout-card">
              {orderNo ? (
                <>
                  <h2>Order {orderNo} received</h2>
                  <p>Thank you, {contact.name}. Your order request has been emailed to our team. Your order number is <strong>{orderNo}</strong>. We'll contact you at {contact.email} to confirm pricing, payment and {delivery === 'delivery' ? 'delivery' : 'collection'}. No payment has been taken.</p>
                  <Link to="/collection" className="piece-select">Continue shopping</Link>
                </>
              ) : (
                <>
                  {step === 1 && (<><h2>Select your shoe</h2><div className="choice-grid">{collection.map(p => (
                    <button key={p.id} className="choice" aria-pressed={p.id === pieceId} onClick={() => setPieceId(p.id)}>
                      <img src={p.images[0]} alt="" />{p.name}<small>{p.colour} · {formatPrice(p.price)}</small>
                    </button>))}</div></>)}
                  {step === 2 && (<><h2>Select your size</h2><div className="choice-grid">{SIZES.map(s => (
                    <button key={s} className="choice" aria-pressed={s === size} onClick={() => setSize(s)}>{s}</button>))}</div></>)}
                  {step === 3 && (<><h2>Quantity</h2><label className="field">Pairs<input type="number" min={1} max={5} value={qty} onChange={e => setQty(Math.min(5, Math.max(1, Number(e.target.value) || 1)))} /></label></>)}
                  {step === 4 && (<><h2>Delivery or collection?</h2><div className="choice-grid">{(['delivery', 'collection'] as Delivery[]).map(d => (
                    <button key={d} className="choice" aria-pressed={d === delivery} onClick={() => setDelivery(d)}>{d === 'delivery' ? 'Courier delivery' : 'Collection'}<small>{d === 'delivery' ? 'Fee confirmed with your order' : 'Arranged after confirmation'}</small></button>))}</div></>)}
                  {step === 5 && (<><h2>Your details</h2><div className="fields">
                    <label className="field">Full name<input value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} /></label>
                    <label className="field">Email<input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
                    <label className="field">Phone<input value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></label>
                    {delivery === 'delivery' && <label className="field">Delivery address<textarea value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} /></label>}
                  </div></>)}
                  {step === 6 && (<><h2>Review your order</h2><p>{qty} × {piece.name} ({piece.colour}), {size}, {delivery === 'delivery' ? `delivered to ${contact.address}` : 'for collection'}.</p><p className="text-sm text-muted-foreground">Payment is confirmed with you after you place the order.</p></>)}
                  {error && <p className="checkout-error" role="alert">{error}</p>}
                  <div className="checkout-nav">
                    <Button variant="outline" disabled={step === 1 || pending} onClick={() => { setError(''); setStep(s => s - 1); }}><ArrowLeft /> Back</Button>
                    {step < STEPS.length ? <Button onClick={next}>Continue <ArrowRight /></Button> : <Button disabled={pending} onClick={placeOrder}>{pending ? 'Sending order…' : 'Place order'} <Check /></Button>}
                  </div>
                </>
              )}
            </div>
          </div>
          <aside className="checkout-summary" aria-label="Order summary">
            <img src={piece.images[0]} alt={piece.name} />
            <h2 className="font-editorial text-2xl mt-4 mb-3">{piece.name}</h2>
            <dl><dt>Colour</dt><dd>{piece.colour}</dd><dt>Size</dt><dd>{size || '—'}</dd><dt>Quantity</dt><dd>{qty}</dd><dt>Unit price</dt><dd>{formatPrice(piece.price)}</dd><dt>{delivery === 'delivery' ? 'Delivery' : 'Collection'}</dt><dd>To be confirmed</dd></dl>
            <div className="checkout-total"><span>Total</span><span>{subtotal === undefined ? 'On request' : formatPrice(subtotal)}</span></div>
          </aside>
        </div>
      </main>
    </AtelierLayout>
  );
}
