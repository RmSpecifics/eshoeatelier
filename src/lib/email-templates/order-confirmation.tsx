import { Body, Container, Head, Heading, Html, Preview, Text, Hr } from '@react-email/components';
import type { TemplateEntry } from './registry';

interface Props {
  orderNo?: string; name?: string; email?: string; phone?: string;
  pieceName?: string; colour?: string; size?: string; quantity?: number;
  delivery?: string; address?: string; total?: string;
}

function OrderConfirmation(props: Props) {
  return <Html lang="en" dir="ltr"><Head /><Preview>New footwear order {props.orderNo ?? ''}</Preview>
    <Body style={{ backgroundColor: '#ffffff', color: '#111111', fontFamily: 'Arial, sans-serif' }}>
      <Container style={{ padding: '32px 24px', maxWidth: '600px' }}>
        <Text style={{ fontFamily: 'Georgia, serif', fontSize: '22px' }}>E'SHOE ATELIER</Text>
        <Heading>Order {props.orderNo ?? 'notification'}</Heading>
        <Text>A customer has submitted a footwear order request. Payment and availability have not yet been confirmed.</Text>
        <Hr />
        <Text>{props.quantity ?? 1} × {props.pieceName ?? 'Footwear'}<br />Colour: {props.colour ?? 'Not specified'}<br />Size: {props.size ?? 'Not specified'}<br />Total: {props.total ?? 'Price on request'}</Text>
        <Text>{props.delivery === 'delivery' ? 'Courier delivery' : 'Collection'}{props.delivery === 'delivery' && <><br />{props.address ?? 'Not specified'}</>}</Text>
        <Hr />
        <Text>Customer: {props.name ?? 'Not specified'}<br />Email: {props.email ?? 'Not specified'}<br />Phone: {props.phone ?? 'Not specified'}</Text>
        <Text>Please contact the customer to confirm pricing, payment and fulfilment.</Text>
      </Container>
    </Body>
  </Html>;
}

export const template = {
  component: OrderConfirmation,
  subject: (data) => `Order ${data['orderNo'] ?? 'request'} — E'SHOE ATELIER`,
  displayName: 'Owner order confirmation',
  to: 'eshoesole@gmail.com',
  previewData: { orderNo: 'ESA-PREVIEW', name: 'Sample customer', email: 'customer@example.com', phone: 'Not specified', pieceName: 'Nike Vomero Roam', colour: 'Blue', size: 'UK 8', quantity: 1, delivery: 'collection', total: 'Price on request' },
} satisfies TemplateEntry;