import { describe, expect, it, vi, beforeEach } from 'vitest';
const m = vi.hoisted(() => ({ send: vi.fn(), row: {} as Record<string, unknown> }));
vi.mock('../lib/email-templates/send-email', () => ({ sendTemplateEmail: m.send }));
function chain(): any { const c: any = { select: () => c, eq: () => c, in: () => c, maybeSingle: async () => ({ data: { ...m.row }, error: null }), single: async () => ({ data: { ...m.row }, error: null }), update: (d: Record<string, unknown>) => { Object.assign(m.row, d); return c; } }; return c; }
vi.mock('../integrations/supabase/client.server', () => ({ supabaseAdmin: { from: () => chain(), storage: { from: () => ({ upload: async () => ({ error: null }), remove: async () => ({}) }) } } }));
import { submitPaymentProof, verifyEft } from '../lib/eft.server';
const id = '01234567-89ab-4cde-8fab-0123456789ab'; const token = 'a'.repeat(72);
const input = { id, token, reference: 'ES-ABCDEFGH', amount: 3500, fileName: 'pop.pdf', contentType: 'application/pdf' as const, fileBase64: btoa('%PDF-1.4 test file') };
beforeEach(() => { m.send.mockReset(); m.send.mockResolvedValue({ sent: true }); m.row = { id, document_token: token, order_no: 'ES-ABCDEFGH', customer_name: 'C', customer_email: 'c@example.com', customer_phone: '1', delivery: 'collection', address: '', items: [{ variantId: 'v', title: 'Shoe', size: 'UK 8', quantity: 2, unitPrice: 1750 }], total: 3500, status: 'awaiting_verification', proof_owner_email_sent: false, proof_ack_sent: false, receipt_email_sent: false, excel_synced: true }; });
const ownerCalls = () => m.send.mock.calls.filter(c => c[1] === 'eshoesole@gmail.com');
describe('payment proof notifications', () => {
  it('sends the business exactly one notification, even when proof is resubmitted', async () => {
    await submitPaymentProof(input); await submitPaymentProof(input);
    expect(ownerCalls()).toHaveLength(1);
    expect(m.row['status']).toBe('verification_required');
  });
  it('does not mark the order paid when proof is uploaded', async () => {
    await submitPaymentProof(input);
    expect(m.row['status']).not.toBe('paid');
  });
  it('sends the business no email when payment is verified', async () => {
    m.row['status'] = 'verification_required';
    await verifyEft(id, 'admin', 'Checked Absa statement');
    expect(ownerCalls()).toHaveLength(0);
    expect(m.send).toHaveBeenCalledWith('eft-instructions', 'c@example.com', expect.objectContaining({ idempotencyKey: `eft-receipt-${id}` }));
  });
});
