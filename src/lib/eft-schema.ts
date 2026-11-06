import { z } from 'zod';

export const eftSchema = z.object({
  submissionId: z.string().uuid(),
  lines: z.array(z.object({ variantId: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/), quantity: z.number().int().min(1).max(5) }).strict()).min(1).max(20),
  delivery: z.enum(['collection', 'delivery']),
  deliveryService: z.enum(['standard', 'express']).default('standard'),
  contact: z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(254), phone: z.string().trim().min(1).max(40), address: z.string().trim().max(1000) }).strict(),
}).strict().refine(d => d.delivery !== 'delivery' || d.contact.address.length > 0, 'Enter a delivery address.');
export type EftInput = z.infer<typeof eftSchema>;
export type EftLine = { variantId: string; title: string; size: string; quantity: number; unitPrice: number };
// Delivery is included in the owner-entered shoe prices; no separate fee is ever added.
export function deliveryFee(_delivery: 'collection' | 'delivery', _service: 'standard' | 'express' = 'standard') { return 0; }
export const PROOF_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;
export const proofSchema = z.object({
  id: z.string().uuid(), token: z.string().regex(/^[a-f0-9-]{72}$/),
  reference: z.string().trim().min(2).max(60), amount: z.number().positive().max(1_000_000),
  fileName: z.string().trim().min(1).max(150), contentType: z.enum(PROOF_TYPES),
  fileBase64: z.string().min(10).max(11_200_000),
}).strict();
export type ProofInput = z.infer<typeof proofSchema>;
export const orderActionSchema = z.object({ id: z.string().uuid(), action: z.enum(['dispatch', 'cancel', 'proof']) }).strict();
export const STATUS_LABELS: Record<string, string> = { awaiting_verification: 'Unpaid · payment pending', verification_required: 'Payment verification required', paid: 'Paid', dispatched: 'Dispatched', cancelled: 'Cancelled' };
export function randomOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `ES-${Array.from(bytes, b => alphabet[b % alphabet.length]).join('')}`;
}
export const verificationSchema = z.object({ id: z.string().uuid(), clearedFundsConfirmed: z.literal(true), note: z.string().trim().min(5).max(500) }).strict();
export function resolveEftLines(input: EftInput['lines'], products: { title: string; variants: { id: string; availableForSale: boolean; title: string; price: { amount: string; currencyCode: string } }[] }[]): EftLine[] {
  if (new Set(input.map(l => l.variantId)).size !== input.length) throw new Error('Duplicate shoe selection.');
  return input.map(line => {
    const product = products.find(p => p.variants.some(v => v.id === line.variantId));
    const variant = product?.variants.find(v => v.id === line.variantId);
    if (!product || !variant || !variant.availableForSale || variant.price.currencyCode !== 'ZAR') throw new Error('This selection is not available for EFT.');
    const unitPrice = Number(variant.price.amount);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('A confirmed price is required.');
    return { ...line, title: product.title, size: variant.title, unitPrice };
  });
}