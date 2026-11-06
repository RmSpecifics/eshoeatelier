import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { OrderDetails, main, container, type OrderSummaryProps } from './eft-order-parts';

function Email(props: OrderSummaryProps) {
  return <Html><Head /><Preview>Your order is on its way — {props.orderNo ?? ''}</Preview><Body style={main}><Container style={container}>
    <Text>E'SHOE ATELIER</Text><Heading>Your order has been dispatched</Heading>
    <Text>Hello {props.name || 'there'}, your order is on its way.</Text>
    <OrderDetails {...props} />
    <Text>Questions? Contact eshoesole@gmail.com.</Text>
  </Container></Body></Html>;
}
export const template = { component: Email, subject: d => `Order dispatched ${d['orderNo']} — E'SHOE ATELIER`, displayName: 'Customer: order dispatched' } satisfies TemplateEntry;
