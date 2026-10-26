import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { EftLine } from './eft-schema';

export type BankDetails = { bank: string; accountHolder: string; accountNumber: string; accountType: string; branchCode: string; swiftCode: string; currency: string };
export async function createEftPdf(order: { order_no: string; customer_name: string; items: EftLine[]; total: number; delivery: string; delivery_fee?: number | string; delivery_service?: string; created_at: string; status: string }, bank: BankDetails) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([595, 842]); let y = 790;
  const safe = (s: string) => s.replace(/[^\x20-\x7E]/g, ' ');
  function line(value: string, heading = false) {
    const words = safe(value).split(/\s+/); let text = '';
    const write = () => { if (y < 60) { page = doc.addPage([595, 842]); y = 790; } page.drawText(text, { x: 48, y, size: heading ? 16 : 11, font: heading ? bold : font }); y -= heading ? 30 : 20; };
    for (const word of words) { const candidate = text ? `${text} ${word}` : word; if (font.widthOfTextAtSize(candidate, heading ? 16 : 11) > 490 && text) { write(); text = word; } else text = candidate; }
    if (text) write();
  }
  line("E'SHOE ATELIER", true); line(order.status === 'paid' ? 'PAYMENT RECEIPT' : 'PRO FORMA INVOICE', true);
  line(`Order: ${order.order_no}`); line(`Date: ${order.created_at.slice(0, 10)}`); line(`Customer: ${order.customer_name}`); y -= 15;
  order.items.forEach(i => { line(`${i.quantity} x ${i.title} - ${i.size}`); line(`Unit: R${i.unitPrice.toFixed(2)} | Line total: R${(i.unitPrice * i.quantity).toFixed(2)}`); });
  y -= 15; line(`Goods subtotal: R${(Number(order.total) - Number(order.delivery_fee ?? 0)).toFixed(2)}`);
  line(`${order.delivery === 'collection' ? 'Collection' : order.delivery_service === 'express' ? 'Express delivery (1-3 days)' : 'Standard delivery'}: R${Number(order.delivery_fee ?? 0).toFixed(2)}`);
  line(`Total payable: R${Number(order.total).toFixed(2)} ZAR`, true);
  if (order.status === 'paid') { line('Paid by EFT - cleared funds independently verified by the atelier.'); }
  else { y -= 15; line('ABSA EFT PAYMENT INSTRUCTIONS', true); line(`Account holder: ${bank.accountHolder}`); line(`Bank: ${bank.bank} | Account type: ${bank.accountType}`); line(`Account number: ${bank.accountNumber}`); line(`Branch code: ${bank.branchCode} | SWIFT: ${bank.swiftCode}`); line(`Payment reference: ${order.order_no}`); line('Awaiting Payment Verification. This invoice does not confirm payment or reserve stock.'); }
  line('Contact: eshoesole@gmail.com');
  return doc.save();
}