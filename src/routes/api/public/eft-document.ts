import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/api/public/eft-document')({ server: { handlers: { GET: async ({ request }) => {
  const url = new URL(request.url);
  const parsed = z.object({ id: z.string().uuid(), token: z.string().regex(/^[a-f0-9-]{72}$/) }).safeParse({ id: url.searchParams.get('id'), token: url.searchParams.get('token') });
  if (!parsed.success) return new Response('Not found', { status: 404 });
  const { paymentDocument } = await import('../../../lib/eft.server');
  const pdf = await paymentDocument(parsed.data.id, parsed.data.token);
  if (!pdf) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="atelier-order.pdf"', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' } });
} } } });