import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '../integrations/supabase/auth-middleware';
import { eftSchema, verificationSchema, proofSchema, orderActionSchema } from './eft-schema';

export const submitEft = createServerFn({ method: 'POST' }).inputValidator((d: unknown) => eftSchema.parse(d)).handler(async ({ data }) => {
  try { const { placeEftOrder } = await import('./eft.server'); return { ok: true as const, order: await placeEftOrder(data) }; }
  catch { return { ok: false as const, message: 'EFT checkout could not be completed. Please retry or contact eshoesole@gmail.com. No payment has been taken.' }; }
});
export const listEftOrders = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!admin) throw new Error('Owner access required.');
  const { data, error } = await context.supabase.from('eft_orders').select('id,order_no,customer_name,customer_email,customer_phone,address,delivery,items,total,status,created_at,receipt_email_sent,excel_synced,proof_path,proof_reference,proof_amount,proof_submitted_at,dispatch_email_sent').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data;
});
export const confirmEftPayment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => verificationSchema.parse(d)).handler(async ({ data, context }) => {
  const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!admin) throw new Error('Owner access required.');
  const { verifyEft } = await import('./eft.server'); return verifyEft(data.id, context.userId, data.note);
});
export const submitProof = createServerFn({ method: 'POST' }).inputValidator((d: unknown) => proofSchema.parse(d)).handler(async ({ data }) => {
  try { const { submitPaymentProof } = await import('./eft.server'); return { ok: true as const, ...(await submitPaymentProof(data)) }; }
  catch (e) { console.error('Proof submission failed', e); return { ok: false as const, message: 'Your proof of payment could not be submitted. Please retry or contact eshoesole@gmail.com.' }; }
});
export const eftOrderAction = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => orderActionSchema.parse(d)).handler(async ({ data, context }) => {
  const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!admin) throw new Error('Owner access required.');
  const { orderAction } = await import('./eft.server'); return orderAction(data.id, data.action);
});
