import { z } from 'zod';
import { fetchShopifyProducts } from './shopify';
import { proofSchema, type ProofInput, eftSchema, resolveEftLines, deliveryFee, randomOrderNumber, type EftInput, type EftLine } from './eft-schema';
import { sendTemplateEmail } from './email-templates/send-email';
import { createEftPdf } from './eft-pdf';
import type { Database } from '../integrations/supabase/types';

export type EftOrder = Database['public']['Tables']['eft_orders']['Row'];
export function getBank() {
  return z.object({ bank: z.string(), accountHolder: z.string(), accountNumber: z.string().regex(/^\d+$/), accountType: z.string(), branchCode: z.string().regex(/^\d{6}$/), swiftCode: z.string(), currency: z.literal('ZAR') }).parse(JSON.parse(process.env['ABSA_EFT_BANK_DETAILS'] ?? '{}'));
}
const origin = 'https://rmspecifics.co.za';
export const documentPath = (o: EftOrder) => `/api/public/eft-document?id=${o.id}&token=${o.document_token}`;
async function sendCustomer(o: EftOrder, paid: boolean) {
  return sendTemplateEmail('eft-instructions', o.customer_email, { idempotencyKey: `eft-${paid ? 'receipt' : 'instructions'}-${o.id}`, templateData: { orderNo: o.order_no, name: o.customer_name, total: `R${Number(o.total).toFixed(2)}`, lines: o.items, bank: paid ? undefined : getBank(), documentUrl: `${origin}${documentPath(o)}`, proofUrl: `${origin}/payment-proof?id=${o.id}&token=${o.document_token}`, paid, deliveryFee: Number(o.delivery_fee), deliveryLabel: o.delivery === 'collection' ? 'Collection' : o.delivery_service === 'express' ? 'Express delivery (1–3 days)' : 'Standard delivery' } });
}
export async function placeEftOrder(input: EftInput) {
  const data = eftSchema.parse(input); const bank = getBank();
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const existing = await db.from('eft_orders').select('*').eq('id', data.submissionId).maybeSingle();
  if (existing.error) throw existing.error;
  let order = existing.data;
  if (order && (order.customer_email !== data.contact.email || order.customer_name !== data.contact.name || order.customer_phone !== data.contact.phone || order.delivery !== data.delivery || order.delivery_service !== data.deliveryService || order.address !== data.contact.address || JSON.stringify((order.items as EftLine[]).map(l => ({ variantId: l.variantId, quantity: l.quantity }))) !== JSON.stringify(data.lines))) throw new Error('Use a new submission for changed details.');
  if (!order) {
    const items = resolveEftLines(data.lines, await fetchShopifyProducts());
    const fee = deliveryFee(data.delivery, data.deliveryService);
    const inserted = await db.from('eft_orders').insert({ id: data.submissionId, order_no: randomOrderNumber(), document_token: crypto.randomUUID()+crypto.randomUUID(), customer_name: data.contact.name, customer_email: data.contact.email, customer_phone: data.contact.phone, address: data.contact.address, delivery: data.delivery, delivery_service: data.deliveryService, delivery_fee: fee, items, total: items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) + fee }).select('*').single();
    if (inserted.error?.code === '23505') return placeEftOrder(input);
    if (inserted.error || !inserted.data) throw inserted.error ?? new Error('Order could not be saved.');
    order = inserted.data;
  }
  let customerSent = order.customer_email_sent;
  if (!customerSent) { try { customerSent = (await sendCustomer(order, false)).sent; } catch { console.error('EFT instruction delivery failed'); } }
  const update = await db.from('eft_orders').update({ ...(customerSent ? { customer_email_sent: true } : {}) }).eq('id', order.id);
  if (update.error) throw update.error;
  return { orderNo: order.order_no, total: Number(order.total), deliveryFee: Number(order.delivery_fee), bank, documentUrl: documentPath(order), customerSent, status: order.status, id: order.id, token: order.document_token };
}
export async function paymentDocument(id: string, token: string) {
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const { data, error } = await db.from('eft_orders').select('*').eq('id', id).eq('document_token', token).maybeSingle();
  if (error || !data) return null;
  return createEftPdf({ ...data, items: data.items as EftLine[], total: Number(data.total) }, getBank());
}
export async function verifyEft(id: string, userId: string, note: string) {
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const changed = await db.from('eft_orders').update({ status: 'paid', verified_by: userId, verified_at: new Date().toISOString(), verification_note: note }).eq('id', id).in('status', ['awaiting_verification', 'verification_required']);
  if (changed.error) throw changed.error;
  const { data: order, error } = await db.from('eft_orders').select('*').eq('id', id).single();
  if (error || !order) throw error ?? new Error('Order not found.');
  if (order.status !== 'paid') throw new Error('Only unpaid orders awaiting payment can be marked paid.');
  let sent = order.receipt_email_sent;
  if (!sent) { try { sent = (await sendCustomer(order, true)).sent; } catch { console.error('EFT receipt delivery failed'); } }
  let synced = order.excel_synced;
  if (!synced) { try { await syncExcel(order); synced = true; } catch { console.error('EFT Excel update failed'); } }
  // No business email on verification: the owner already received one notification when proof was submitted.
  const updated = await db.from('eft_orders').update({ ...(sent ? { receipt_email_sent: true } : {}), ...(synced ? { excel_synced: true } : {}) }).eq('id', id);
  if (updated.error) throw updated.error;
  return { paid: true, receiptSent: sent, excelSynced: synced };
}

async function syncExcel(order: EftOrder) {
  const key = process.env['MICROSOFT_EXCEL_API_KEY']; const auth = process.env['LOVABLE_API_KEY']; const workbook = process.env['EFT_EXCEL_WORKBOOK_ID'];
  if (!key || !auth || !workbook || !order.excel_row) throw new Error('Excel connection unavailable.');
  const row = order.excel_row;
  const response = await fetch(`https://connector-gateway.lovable.dev/microsoft_excel/me/drive/items/${encodeURIComponent(workbook)}/workbook/worksheets/Paid%20orders/range(address='A${row}:I${row}')`, { method: 'PATCH', headers: { Authorization: `Bearer ${auth}`, 'X-Connection-Api-Key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [[order.order_no, excelText(order.customer_name), excelText(order.customer_email), Number(order.total), 'Paid', order.verified_at ?? '', excelText(order.verification_note ?? ''), excelText((order.items as EftLine[]).map(l => `${l.quantity} x ${l.title} ${l.size}`).join('; ')), order.delivery]] }) });
  if (!response.ok) { console.error('Excel update status', response.status, await response.text()); throw new Error('Excel update rejected'); }
}
function excelText(value: string) { return /^[=+\-@]/.test(value) ? `'${value}` : value; }
const money = (n: number) => `R${n.toFixed(2)}`;
function orderSummary(o: EftOrder) {
  return { orderNo: o.order_no, name: o.customer_name, email: o.customer_email, phone: o.customer_phone, address: o.delivery === 'collection' ? 'Collection by arrangement' : o.address, lines: (o.items as EftLine[]).map(l => ({ title: l.title, size: l.size, quantity: l.quantity, unitPrice: money(l.unitPrice), lineTotal: money(l.unitPrice * l.quantity) })), total: money(Number(o.total)), reference: o.proof_reference ?? o.order_no, proofAmount: o.proof_amount == null ? '' : money(Number(o.proof_amount)) };
}
function decodeBase64(b64: string) { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
export async function submitPaymentProof(input: ProofInput) {
  const data = proofSchema.parse(input);
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const found = await db.from('eft_orders').select('*').eq('id', data.id).eq('document_token', data.token).maybeSingle();
  if (found.error || !found.data) throw new Error('Order not found.');
  let order = found.data;
  if (order.status === 'cancelled') throw new Error('This order was cancelled.');
  if (order.status === 'awaiting_verification') {
    const bytes = decodeBase64(data.fileBase64);
    if (bytes.length > 8 * 1024 * 1024) throw new Error('File too large.');
    const ext = data.contentType === 'application/pdf' ? 'pdf' : data.contentType.split('/')[1];
    const path = `${order.id}/${crypto.randomUUID()}.${ext}`;
    const up = await db.storage.from('payment-proofs').upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (up.error) throw up.error;
    const changed = await db.from('eft_orders').update({ status: 'verification_required', proof_path: path, proof_reference: data.reference, proof_amount: data.amount, proof_submitted_at: new Date().toISOString() }).eq('id', order.id).eq('status', 'awaiting_verification').select('*').maybeSingle();
    if (changed.error) throw changed.error;
    if (changed.data) order = changed.data; else { await db.storage.from('payment-proofs').remove([path]); const again = await db.from('eft_orders').select('*').eq('id', order.id).single(); if (again.data) order = again.data; }
  }
  const summary = orderSummary(order);
  let ownerSent = order.proof_owner_email_sent; let ackSent = order.proof_ack_sent;
  if (order.proof_path && !ownerSent) { try { ownerSent = (await sendTemplateEmail('eft-proof-owner', 'eshoesole@gmail.com', { idempotencyKey: `eft-proof-owner-${order.id}`, replyTo: order.customer_email, templateData: { ...summary, reviewUrl: `${origin}/pricing` } })).sent; } catch { console.error('Owner proof notification failed'); } }
  if (order.proof_path && !ackSent) { try { ackSent = (await sendTemplateEmail('eft-proof-ack', order.customer_email, { idempotencyKey: `eft-proof-ack-${order.id}`, templateData: summary })).sent; } catch { console.error('Proof acknowledgement failed'); } }
  await db.from('eft_orders').update({ ...(ownerSent ? { proof_owner_email_sent: true } : {}), ...(ackSent ? { proof_ack_sent: true } : {}) }).eq('id', order.id);
  return { status: order.status, acknowledged: ackSent };
}
export async function orderAction(id: string, action: 'dispatch' | 'cancel' | 'proof') {
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const { data: order, error } = await db.from('eft_orders').select('*').eq('id', id).single();
  if (error || !order) throw new Error('Order not found.');
  if (action === 'proof') {
    if (!order.proof_path) throw new Error('No proof submitted.');
    const signed = await db.storage.from('payment-proofs').createSignedUrl(order.proof_path, 300);
    if (signed.error) throw signed.error;
    return { url: signed.data.signedUrl };
  }
  if (action === 'cancel') {
    if (order.status === 'paid' || order.status === 'dispatched') throw new Error('Paid orders cannot be cancelled here.');
    await db.from('eft_orders').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id).in('status', ['awaiting_verification', 'verification_required']);
    return { ok: true };
  }
  if (order.status !== 'paid' && order.status !== 'dispatched') throw new Error('Only paid orders can be dispatched.');
  if (order.status === 'paid') await db.from('eft_orders').update({ status: 'dispatched', dispatched_at: new Date().toISOString() }).eq('id', id).eq('status', 'paid');
  let sent = order.dispatch_email_sent;
  if (!sent) { try { sent = (await sendTemplateEmail('eft-dispatched', order.customer_email, { idempotencyKey: `eft-dispatched-${order.id}`, templateData: orderSummary(order) })).sent; } catch { console.error('Dispatch email failed'); } }
  if (sent) await db.from('eft_orders').update({ dispatch_email_sent: true }).eq('id', id);
  return { ok: true, dispatchSent: sent };
}
