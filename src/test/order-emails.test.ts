import { describe, expect, it, vi } from 'vitest';
import { orderSchema } from '../lib/order-schema';
import { template } from '../lib/email-templates/order-confirmation';

const send = vi.hoisted(() => vi.fn());
vi.mock('../lib/email-templates/send-email', () => ({ sendTemplateEmail: send }));
import { notifyOwner } from '../lib/orders.server';

const order = {
  submissionId: '01234567-89ab-4cde-8fab-0123456789ab', pieceId: '04', size: 'UK 8', qty: 1,
  delivery: 'collection' as const,
  contact: { name: 'Sample customer', email: 'customer@example.com', phone: '0123456789', address: '' },
};

describe('Owner order notifications', () => {
  it('always sends order number and details to eshoesole@gmail.com', async () => {
    send.mockResolvedValue({ sent: true });
    const result = await notifyOwner(order);
    expect(template.to).toBe('eshoesole@gmail.com');
    expect(send).toHaveBeenCalledWith('order-confirmation', 'eshoesole@gmail.com', expect.objectContaining({
      idempotencyKey: 'order-confirmation-01234567-89ab-4cde-8fab-0123456789ab',
      templateData: expect.objectContaining({ orderNo: result.orderNo, pieceName: 'Nike Vomero Roam', size: 'UK 8', quantity: 1 }),
    }));
    expect(result.sent).toBe(true);
  });

  it('does not claim success when the owner recipient is suppressed', async () => {
    send.mockResolvedValue({ sent: false, reason: 'recipient_suppressed' });
    expect((await notifyOwner(order)).sent).toBe(false);
  });

  it('rejects unrecognised shoes before sending', () => {
    expect(orderSchema.safeParse({ ...order, pieceId: 'unknown' }).success).toBe(false);
  });
});