import { collection, formatPrice } from './collection';
import { orderSchema, type OrderInput } from './order-schema';
import { sendTemplateEmail } from './email-templates/send-email';

export async function notifyOwner(input: OrderInput) {
  const data = orderSchema.parse(input);
  const piece = collection.find(piece => piece.id === data.pieceId);
  if (!piece) throw new Error('Choose a valid shoe.');
  const orderNo = `ESA-${data.submissionId.toUpperCase()}`;
  const result = await sendTemplateEmail('order-confirmation', 'eshoesole@gmail.com', {
    idempotencyKey: `order-confirmation-${data.submissionId}`,
    replyTo: data.contact.email,
    templateData: {
      orderNo, ...data.contact, pieceName: piece.name, colour: piece.colour,
      size: data.size, quantity: data.qty, delivery: data.delivery,
      total: formatPrice(piece.price === undefined ? undefined : piece.price * data.qty),
    },
  });
  return { orderNo, sent: result.sent };
}