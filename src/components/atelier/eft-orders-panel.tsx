import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { listEftOrders, confirmEftPayment, eftOrderAction } from '../../lib/eft.functions';
import { STATUS_LABELS, type EftLine } from '../../lib/eft-schema';
import { Button } from '../ui/button';
import { formatPrice } from '../../lib/collection';

export function EftOrdersPanel() {
  const list = useServerFn(listEftOrders); const confirm = useServerFn(confirmEftPayment);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof listEftOrders>>>([]);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function refresh() { try { setOrders(await list()); } catch { setError('Orders could not be loaded.'); } }
  useEffect(() => { void refresh(); }, []);
  async function verify(id: string, note: string, checked: boolean) {
    if (!checked || note.trim().length < 5) { setError('Confirm cleared funds and enter a verification note.'); return; }
    setBusy(true); setError('');
    try { const result = await confirm({ data: { id, note, clearedFundsConfirmed: true } }); await refresh(); setError(`Payment verified. ${result.receiptSent ? 'Receipt emailed.' : 'Receipt email needs retrying.'} ${result.excelSynced ? 'Excel updated.' : 'Excel update needs retrying.'}`); }
    catch { setError('Payment could not be verified. Please try again.'); } finally { setBusy(false); }
  }
  const action = useServerFn(eftOrderAction);
  async function act(id: string, kind: 'dispatch' | 'cancel' | 'proof') {
    if (kind === 'cancel' && !window.confirm('Cancel this unpaid order? The record is kept.')) return;
    setBusy(true); setError('');
    try { const r = await action({ data: { id, action: kind } }); if ('url' in r) window.open(r.url, '_blank', 'noopener'); else { await refresh(); setError(kind === 'dispatch' ? 'Marked dispatched; customer notified.' : 'Order cancelled.'); } }
    catch { setError('That action could not be completed.'); } finally { setBusy(false); }
  }
  return <section className="mt-12 border-t pt-8"><div className="flex items-center justify-between gap-4"><h2>EFT orders</h2><Button variant="outline" onClick={() => void refresh()}>Refresh</Button></div>{error && <p role="status">{error}</p>}{orders.length === 0 && <p>No EFT orders yet.</p>}{orders.map(o => <OrderRow key={o.id} order={o} busy={busy} verify={verify} act={act} />)}</section>;
}
function OrderRow({ order, busy, verify, act }: { order: Awaited<ReturnType<typeof listEftOrders>>[number]; busy: boolean; verify: (id: string, note: string, checked: boolean) => Promise<void>; act: (id: string, kind: 'dispatch' | 'cancel' | 'proof') => Promise<void> }) {
  const [note, setNote] = useState(''); const [checked, setChecked] = useState(false);
  return <div className="border-b py-6 space-y-3"><h3 className="font-editorial text-xl break-all">{order.order_no}</h3><p>{order.customer_name} · {order.customer_email} · {order.customer_phone}</p><p className="text-sm">{order.delivery === 'collection' ? 'Collection' : order.address}</p>{(order.items as EftLine[]).map(l => <p key={l.variantId} className="text-sm">{l.quantity} × {l.title} · Size {l.size} · {formatPrice(l.unitPrice)}</p>)}<p>Total payable {formatPrice(Number(order.total))} · <strong>{STATUS_LABELS[order.status] ?? order.status}</strong></p>{order.proof_path ? <div className="text-sm space-y-2"><p>Proof submitted · reference {order.proof_reference} · amount stated {formatPrice(Number(order.proof_amount))}{Number(order.proof_amount) !== Number(order.total) ? ' — DOES NOT MATCH total' : ''}</p><Button variant="outline" disabled={busy} onClick={() => void act(order.id, 'proof')}>View proof of payment</Button></div> : <p className="text-sm">No proof of payment submitted yet.</p>}{order.status === 'paid' && <Button disabled={busy} onClick={() => void act(order.id, 'dispatch')}>Mark dispatched</Button>}{(order.status === 'awaiting_verification' || order.status === 'verification_required') && <Button variant="outline" disabled={busy} onClick={() => void act(order.id, 'cancel')}>Cancel / could not verify</Button>}{order.status === 'paid' && <p className="text-sm">Receipt: {order.receipt_email_sent ? 'Emailed' : 'Pending'} · Excel: {order.excel_synced ? 'Recorded' : 'Pending'}</p>}{(order.status === 'awaiting_verification' || order.status === 'verification_required') && <><label className="flex gap-3 items-start"><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />I independently checked my bank account and confirmed cleared funds for this order.</label><label className="field">Bank verification note<input maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Date, amount and bank reference checked" /></label><Button disabled={busy || !checked || note.trim().length < 5} onClick={() => void verify(order.id, note, checked)}>Confirm cleared EFT payment</Button></>}{order.status === 'paid' && (!order.receipt_email_sent || !order.excel_synced) && <Button variant="outline" disabled={busy} onClick={() => void verify(order.id, order.order_no + ' delivery retry', true)}>Retry receipt and register</Button>}</div>;
}