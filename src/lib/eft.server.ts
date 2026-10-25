import { z } from 'zod';
import { fetchShopifyProducts } from './shopify';
import { eftSchema, resolveEftLines, type EftInput, type EftLine } from './eft-schema';
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
  return sendTemplateEmail('eft-instructions', o.customer_email, { idempotencyKey: `eft-${paid ? 'receipt' : 'instructions'}-${o.id}`, templateData: { orderNo: o.order_no, name: o.customer_name, total: `R${Number(o.total).toFixed(2)}`, lines: o.items, bank: paid ? undefined : getBank(), documentUrl: `${origin}${documentPath(o)}`, paid, courier: o.delivery === 'delivery' } });
}
export async function placeEftOrder(input: EftInput) {
  const data = eftSchema.parse(input); const bank = getBank();
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const existing = await db.from('eft_orders').select('*').eq('id', data.submissionId).maybeSingle();
  if (existing.error) throw existing.error;
  let order = existing.data;
  if (order && (order.customer_email !== data.contact.email || order.customer_name !== data.contact.name || order.customer_phone !== data.contact.phone || order.delivery !== data.delivery || order.address !== data.contact.address || JSON.stringify((order.items as EftLine[]).map(l => ({ variantId: l.variantId, quantity: l.quantity }))) !== JSON.stringify(data.lines))) throw new Error('Use a new submission for changed details.');
  if (!order) {
    const items = resolveEftLines(data.lines, await fetchShopifyProducts());
    const inserted = await db.from('eft_orders').insert({ id: data.submissionId, order_no: `ESA-${data.submissionId.toUpperCase()}`, document_token: crypto.randomUUID()+crypto.randomUUID(), customer_name: data.contact.name, customer_email: data.contact.email, customer_phone: data.contact.phone, address: data.contact.address, delivery: data.delivery, items, total: items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) }).select('*').single();
    if (inserted.error || !inserted.data) throw inserted.error ?? new Error('Order could not be saved.');
    order = inserted.data;
  }
  let customerSent = order.customer_email_sent;
  let ownerSent = order.owner_email_sent;
  if (!customerSent) { try { customerSent = (await sendCustomer(order, false)).sent; } catch { console.error('EFT instruction delivery failed'); } }
  if (!ownerSent) { try { ownerSent = (await sendTemplateEmail('order-confirmation', 'eshoesole@gmail.com', { idempotencyKey: `eft-owner-${order.id}`, replyTo: order.customer_email, templateData: { orderNo: order.order_no, name: order.customer_name, email: order.customer_email, phone: order.customer_phone, address: order.address, pieceName: (order.items as EftLine[]).map(l => `${l.quantity} x ${l.title} (${l.size})`).join('; '), size: 'See item details', quantity: 1, total: `R${Number(order.total).toFixed(2)}`, delivery: order.delivery } })).sent; } catch { console.error('EFT owner delivery failed'); } }
  const update = await db.from('eft_orders').update({ customer_email_sent: customerSent, owner_email_sent: ownerSent }).eq('id', order.id);
  if (update.error) throw update.error;
  return { orderNo: order.order_no, total: Number(order.total), bank, documentUrl: documentPath(order), customerSent, ownerSent, status: order.status };
}
export async function paymentDocument(id: string, token: string) {
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const { data, error } = await db.from('eft_orders').select('*').eq('id', id).eq('document_token', token).maybeSingle();
  if (error || !data) return null;
  return createEftPdf({ ...data, items: data.items as EftLine[], total: Number(data.total) }, getBank());
}
export async function verifyEft(id: string, userId: string, note: string) {
  const { supabaseAdmin: db } = await import('../integrations/supabase/client.server');
  const changed = await db.from('eft_orders').update({ status: 'paid', verified_by: userId, verified_at: new Date().toISOString(), verification_note: note }).eq('id', id).eq('status', 'awaiting_verification');
  if (changed.error) throw changed.error;
  const { data: order, error } = await db.from('eft_orders').select('*').eq('id', id).single();
  if (error || !order) throw error ?? new Error('Order not found.');
  let sent = order.receipt_email_sent;
  if (!sent) { try { sent = (await sendCustomer(order, true)).sent; } catch { console.error('EFT receipt delivery failed'); } }
  let synced = order.excel_synced;
  if (!synced) { try { await syncExcel(order); synced = true; } catch { console.error('EFT Excel update failed'); } }
  if (order.status === 'paid') { try { await sendTemplateEmail('eft-owner-paid', 'eshoesole@gmail.com', { idempotencyKey: `eft-owner-paid-${order.id}`, templateData: { orderNo: order.order_no, name: order.customer_name, total: `R${Number(order.total).toFixed(2)}` } }); } catch { console.error('Owner payment notification failed'); } }
  const updated = await db.from('eft_orders').update({ receipt_email_sent: sent, excel_synced: synced }).eq('id', id);
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