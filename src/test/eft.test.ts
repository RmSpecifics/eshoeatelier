import { describe, expect, it } from 'vitest';
import { eftSchema, resolveEftLines, verificationSchema, deliveryFee, randomOrderNumber } from '../lib/eft-schema';

const variantId = 'gid://shopify/ProductVariant/123';
const input = { submissionId: '01234567-89ab-4cde-8fab-0123456789ab', lines: [{ variantId, quantity: 2 }], delivery: 'collection', contact: { name: 'Customer', email: 'customer@example.com', phone: '0123456789', address: '' } };
describe('Absa EFT payment rules', () => {
  it('charges R150 standard delivery per order', () => { expect(deliveryFee('delivery', 'standard')).toBe(150); });
  it('charges R250 for express delivery', () => { expect(deliveryFee('delivery', 'express')).toBe(250); });
  it('keeps collection free', () => { expect(deliveryFee('collection', 'express')).toBe(0); });
  it('generates short random order references instead of submission UUIDs', () => { const first = randomOrderNumber(); expect(first).toMatch(/^ES-[A-HJ-NP-Z2-9]{8}$/); expect(randomOrderNumber()).not.toBe(first); });
  it('does not accept proof alone as cleared-funds verification', () => {
    expect(verificationSchema.safeParse({ id: input.submissionId, clearedFundsConfirmed: false, note: 'Screenshot received' }).success).toBe(false);
    expect(verificationSchema.safeParse({ id: input.submissionId, clearedFundsConfirmed: true, note: 'Cleared funds checked' }).success).toBe(true);
  });
  it('uses confirmed ZAR Shopify prices rather than browser totals', () => {
    const rows = resolveEftLines(input.lines, [{ title: 'Shoe', variants: [{ id: variantId, title: 'UK 8', availableForSale: true, price: { amount: '1750.00', currencyCode: 'ZAR' } }] }]);
    expect(rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0)).toBe(3500);
    expect(eftSchema.safeParse({ ...input, total: 1 }).success).toBe(false);
  });
  it('requires a delivery address for courier orders', () => {
    expect(eftSchema.safeParse({ ...input, delivery: 'delivery' }).success).toBe(false);
  });
  it('rejects unavailable variants and non-ZAR charges', () => {
    expect(() => resolveEftLines(input.lines, [{ title: 'Shoe', variants: [{ id: variantId, title: 'UK 8', availableForSale: false, price: { amount: '1750', currencyCode: 'ZAR' } }] }])).toThrow();
    expect(() => resolveEftLines(input.lines, [{ title: 'Shoe', variants: [{ id: variantId, title: 'UK 8', availableForSale: true, price: { amount: '1750', currencyCode: 'USD' } }] }])).toThrow();
  });
});