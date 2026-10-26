import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ send: vi.fn(), update: vi.fn(), order: { id: '01234567-89ab-4cde-8fab-0123456789ab', order_no: 'ES-ABCDEFGH', customer_name: 'Customer', customer_email: 'customer@example.com', customer_phone: '0123456789', delivery: 'collection', delivery_service: 'standard', delivery_fee: 0, address: '', items: [{ variantId: 'gid://shopify/ProductVariant/123', quantity: 2 }], total: 3500, customer_email_sent: false, status: 'awaiting_verification', document_token: 'private-token' } }));
vi.mock('../lib/email-templates/send-email', () => ({ sendTemplateEmail: mocks.send }));
vi.mock('../integrations/supabase/client.server', () => ({ supabaseAdmin: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: mocks.order }) }) }), update: (data: unknown) => { mocks.update(data); return { eq: async () => ({ error: null }) }; } }) } }));
import { placeEftOrder } from '../lib/eft.server';
describe('Paid-only owner notifications', () => {
  it('does not send an owner notification for an unpaid EFT order', async () => {
    process.env['ABSA_EFT_BANK_DETAILS'] = JSON.stringify({ bank: 'Test Bank', accountHolder: 'Test', accountNumber: '1234567890', accountType: 'Current', branchCode: '123456', swiftCode: 'TEST', currency: 'ZAR' });
    mocks.send.mockResolvedValue({ sent: true });
    await placeEftOrder({ submissionId: mocks.order.id, lines: mocks.order.items, delivery: 'collection', deliveryService: 'standard', contact: { name: 'Customer', email: 'customer@example.com', phone: '0123456789', address: '' } });
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledWith('eft-instructions', 'customer@example.com', expect.any(Object));
    expect(mocks.send.mock.calls.some(call => call[1] === 'eshoesole@gmail.com')).toBe(false);
  });
});