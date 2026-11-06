import { Section, Text } from '@react-email/components';

export type SummaryLine = { title: string; size: string; quantity: number; unitPrice: string; lineTotal: string };
export type OrderSummaryProps = { orderNo?: string; name?: string; email?: string; phone?: string; address?: string; lines?: SummaryLine[]; total?: string; reference?: string; proofAmount?: string };
export const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111111' };
export const container = { padding: '32px 24px', maxWidth: '600px' };

export function OrderDetails({ orderNo = '', name = '', email = '', phone = '', address = '', lines = [], total = '', reference = '', proofAmount = '' }: OrderSummaryProps) {
  return <Section>
    <Text>Order number: <strong>{orderNo}</strong><br />Customer: {name}<br />Phone: {phone}<br />Email: {email}<br />Delivery address: {address}</Text>
    {lines.map((l, i) => <Text key={i}>{l.quantity} × {l.title} · Size {l.size} · {l.unitPrice} each = {l.lineTotal}</Text>)}
    <Text>Discounts: none<br /><strong>Total payable: {total}</strong><br />Payment reference: {reference}{proofAmount ? <><br />Amount customer says was transferred: {proofAmount}</> : null}</Text>
  </Section>;
}
