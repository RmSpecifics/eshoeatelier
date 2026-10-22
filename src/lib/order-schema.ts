import { z } from 'zod';
import { collection, SIZES } from './collection';

export const orderSchema = z.object({
  submissionId: z.string().uuid(),
  pieceId: z.string().refine(id => collection.some(piece => piece.id === id), 'Choose a valid shoe.'),
  size: z.string().refine(size => SIZES.includes(size), 'Choose a valid size.'),
  qty: z.number().int().min(1).max(5),
  delivery: z.enum(['delivery', 'collection']),
  contact: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(1).max(40),
    address: z.string().trim().max(1000),
  }).strict(),
}).strict().refine(data => data.delivery !== 'delivery' || data.contact.address.length > 0, 'Enter a delivery address.');

export type OrderInput = z.infer<typeof orderSchema>;