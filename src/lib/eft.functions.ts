import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '../integrations/supabase/auth-middleware';
import { eftSchema, verificationSchema } from './eft-schema';

export const submitEft = createServerFn({ method: 'POST' }).inputValidator((d: unknown) => eftSchema.parse(d)).handler(async ({ data }) => {
  try { const { placeEftOrder } = await import('./eft.server'); return { ok: true as const, order: await placeEftOrder(data) }; }
  catch { return { ok: false as const, message: 'EFT checkout could not be completed. Please retry or contact eshoesole@gmail.com. No payment has been taken.' }; }
});
export const listEftOrders = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!admin) throw new Error('Owner access required.');
  const { data, error } = await context.supabase.from('eft_orders').select('id,order_no,customer_name,customer_email,total,status,created_at,receipt_email_sent,excel_synced').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data;
});
export const confirmEftPayment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => verificationSchema.parse(d)).handler(async ({ data, context }) => {
  const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!admin) throw new Error('Owner access required.');
  const { verifyEft } = await import('./eft.server'); return verifyEft(data.id, context.userId, data.note);
});