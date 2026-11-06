import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { OrderDetails, main, container, type OrderSummaryProps } from './eft-order-parts';

function Email(props: OrderSummaryProps & { reviewUrl?: string }) {
  return <Html><Head /><Preview>Payment proof submitted — NOT YET VERIFIED — {props.orderNo ?? ''}</Preview><Body style={main}><Container style={container}>
    <Text>E'SHOE ATELIER</Text><Heading>Payment submitted — NOT YET VERIFIED</Heading>
    <Text>The customer has uploaded proof of payment. A screenshot or slip is not proof that funds have cleared. Check your Absa account before marking this order paid.</Text>
    <OrderDetails {...props} />
    <Text>Proof of payment status: submitted, awaiting your verification.</Text>
    <Link href={props.reviewUrl ?? 'https://rmspecifics.co.za/pricing'}>Sign in to view the proof and verify payment</Link>
  </Container></Body></Html>;
}
export const template = { component: Email, to: 'eshoesole@gmail.com', subject: d => `Payment proof submitted (not verified) ${d['orderNo']} — E'SHOE ATELIER`, displayName: 'Owner: payment proof submitted', previewData: { orderNo: 'ES-ABCD2345', name: 'Jane', total: 'R1 750.00', lines: [{ title: 'Nike Vomero Roam', size: 'UK 8', quantity: 1, unitPrice: 'R1750.00', lineTotal: 'R1750.00' }] } } satisfies TemplateEntry;
