import { createFileRoute } from '@tanstack/react-router';
import { AtelierLayout } from '../components/atelier/layout';
import { PaymentProofForm } from '../components/atelier/payment-proof-form';
import { pageHead } from '../lib/collection';

export const Route = createFileRoute('/payment-proof')({
  validateSearch: (s: Record<string, unknown>): { id?: string; token?: string } => ({ ...(typeof s['id'] === 'string' ? { id: s['id'] } : {}), ...(typeof s['token'] === 'string' ? { token: s['token'] } : {}) }),
  head: () => pageHead('Submit Proof of Payment', "Upload your E'SHOE ATELIER EFT proof of payment for verification.", '/payment-proof'),
  component: ProofPage,
});
function ProofPage() {
  const { id, token } = Route.useSearch();
  return <AtelierLayout><section className="checkout"><span className="eyebrow">ABSA BANK TRANSFER</span><h1>Proof of payment</h1>
    {id && token ? <div className="max-w-xl"><PaymentProofForm id={id} token={token} /></div> : <p>Please open the link from your order email.</p>}
  </section></AtelierLayout>;
}
