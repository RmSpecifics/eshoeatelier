import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { listEftOrders, confirmEftPayment } from '../../lib/eft.functions';
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
  return <section className="mt-12 border-t pt-8"><div className="flex items-center justify-between gap-4"><h2>EFT orders</h2><Button variant="outline" onClick={() => void refresh()}>Refresh</Button></div>{error && <p role="status">{error}</p>}{orders.length === 0 && <p>No EFT orders yet.</p>}{orders.map(o => <OrderRow key={o.id} order={o} busy={busy} verify={verify} />)}</section>;
}
function OrderRow({ order, busy, verify }: { order: Awaited<ReturnType<typeof listEftOrders>>[number]; busy: boolean; verify: (id: string, note: string, checked: boolean) => Promise<void> }) {
  const [note, setNote] = useState(''); const [checked, setChecked] = useState(false);
  return <div className="border-b py-6 space-y-3"><h3 className="font-editorial text-xl break-all">{order.order_no}</h3><p>{order.customer_name} · {order.customer_email}</p><p>{formatPrice(Number(order.total))} · {order.status === 'paid' ? 'Paid' : 'Awaiting Payment Verification'}</p>{order.status === 'paid' && <p className="text-sm">Receipt: {order.receipt_email_sent ? 'Emailed' : 'Pending'} · Excel: {order.excel_synced ? 'Recorded' : 'Pending'}</p>}{order.status !== 'paid' && <><label className="flex gap-3 items-start"><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />I independently checked my bank account and confirmed cleared funds for this order.</label><label className="field">Bank verification note<input maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Date, amount and bank reference checked" /></label><Button disabled={busy || !checked || note.trim().length < 5} onClick={() => void verify(order.id, note, checked)}>Confirm cleared EFT payment</Button></>}{order.status === 'paid' && (!order.receipt_email_sent || !order.excel_synced) && <Button variant="outline" disabled={busy} onClick={() => void verify(order.id, order.order_no + ' delivery retry', true)}>Retry receipt and register</Button>}</div>;
}