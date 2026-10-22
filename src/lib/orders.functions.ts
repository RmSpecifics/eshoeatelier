import { createServerFn } from '@tanstack/react-start';
import { orderSchema } from './order-schema';

export const submitOrder = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { notifyOwner } = await import('./orders.server');
      const result = await notifyOwner(data);
      if (!result.sent) return { ok: false as const, message: 'Order emails are unavailable. Please contact eshoesole@gmail.com to place your order.' };
      return { ok: true as const, orderNo: result.orderNo };
    } catch {
      return { ok: false as const, message: 'Your order could not be sent. Please try again later or contact eshoesole@gmail.com. No payment has been taken.' };
    }
  });