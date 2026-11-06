import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { OrderDetails, main, container, type OrderSummaryProps } from './eft-order-parts';

function Email(props: OrderSummaryProps) {
  return <Html><Head /><Preview>We received your proof of payment — {props.orderNo ?? ''}</Preview><Body style={main}><Container style={container}>
    <Text>E'SHOE ATELIER</Text><Heading>Proof of payment received</Heading>
    <Text>Hello {props.name || 'there'}, thank you. We'll check that the funds have reached our account and email you once your payment is confirmed.</Text>
    <OrderDetails {...props} />
    <Text>Questions? Contact eshoesole@gmail.com.</Text>
  </Container></Body></Html>;
}
export const template = { component: Email, subject: d => `Proof of payment received ${d['orderNo']} — E'SHOE ATELIER`, displayName: 'Customer: proof received' } satisfies TemplateEntry;
