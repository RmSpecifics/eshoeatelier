import { describe, expect, it } from 'vitest';
import { priceSchema, priceTotal } from '../lib/prices';
describe('Owner-entered ZAR prices', () => {
  it('accepts manually entered prices for a catalogue shoe', () => { expect(priceSchema.parse({ pieceId: '05', amount: 1250.50 }).amount).toBe(1250.50); });
  it('rejects negative prices', () => { expect(priceSchema.safeParse({ pieceId: '01', amount: -1 }).success).toBe(false); });
  it('preserves unknown prices rather than inventing an amount', () => { expect(priceTotal(undefined, 3)).toBeUndefined(); });
  it('calculates the quantity total from the entered price', () => { expect(priceTotal(1250.50, 3)).toBe(3751.50); });
});