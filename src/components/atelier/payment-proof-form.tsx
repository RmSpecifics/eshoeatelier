import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '../ui/button';
import { submitProof } from '../../lib/eft.functions';
import { PROOF_TYPES, proofSchema } from '../../lib/eft-schema';

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result).split(',')[1] ?? ''); r.onerror = () => reject(r.error); r.readAsDataURL(file); });
}

export function PaymentProofForm({ id, token, defaultReference = '' }: { id: string; token: string; defaultReference?: string }) {
  const send = useServerFn(submitProof);
  const [reference, setReference] = useState(defaultReference); const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return; setError('');
    if (!file || !(PROOF_TYPES as readonly string[]).includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Upload a PDF, JPG, PNG or WEBP file up to 8 MB.'); return; }
    setBusy(true);
    try {
      const parsed = proofSchema.safeParse({ id, token, reference, amount: Number(amount.replace(/\s/g, '').replace(',', '.')), fileName: file.name.slice(0, 150), contentType: file.type, fileBase64: await toBase64(file) });
      if (!parsed.success) { setError('Enter your payment reference and the amount you transferred.'); return; }
      const res = await send({ data: parsed.data });
      if (res.ok) setDone(true); else setError(res.message);
    } catch { setError('Your proof of payment could not be submitted. Please try again.'); } finally { setBusy(false); }
  }
  if (done) return <p role="status" className="checkout-summary">Thank you — your proof of payment was received. Your order now awaits payment verification. We'll email you once the funds have cleared.</p>;
  return <form onSubmit={submit} className="checkout-summary space-y-4">
    <h2>Submit proof of payment</h2>
    <p className="text-sm">After making your EFT, upload the bank's proof of payment. Your order is only confirmed once funds reach our account.</p>
    <label className="field">Payment reference used<input required maxLength={60} value={reference} onChange={e => setReference(e.target.value)} /></label>
    <label className="field">Amount transferred (R)<input required inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 1750.00" /></label>
    <label className="field">Proof of payment (PDF or image)<input required type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
    {error && <p role="alert" className="checkout-error">{error}</p>}
    <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit payment confirmation'}</Button>
  </form>;
}
