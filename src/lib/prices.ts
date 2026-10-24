import { z } from 'zod';

export const priceSchema = z.object({ pieceId: z.enum(['01','02','03','04','05','06','07']), amount: z.number().finite().nonnegative().refine(n => Number.isInteger(Math.round(n * 10000) / 100), 'Use at most two decimal places') });
export function priceTotal(price: number | undefined, quantity: number) { return price === undefined ? undefined : Math.round(price * quantity * 100) / 100; }