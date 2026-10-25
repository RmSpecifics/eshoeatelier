CREATE TABLE public.eft_orders (
 id uuid PRIMARY KEY,
 order_no text NOT NULL UNIQUE,
 document_token text NOT NULL UNIQUE,
 customer_name text NOT NULL,
 customer_email text NOT NULL,
 customer_phone text NOT NULL,
 delivery text NOT NULL CHECK (delivery IN ('collection','delivery')),
 address text NOT NULL DEFAULT '',
 items jsonb NOT NULL,
 total numeric(12,2) NOT NULL CHECK (total > 0),
 status text NOT NULL DEFAULT 'awaiting_verification' CHECK (status IN ('awaiting_verification','paid')),
 created_at timestamptz NOT NULL DEFAULT now(),
 verified_at timestamptz,
 verified_by uuid,
 verification_note text,
 customer_email_sent boolean NOT NULL DEFAULT false,
 owner_email_sent boolean NOT NULL DEFAULT false,
 receipt_email_sent boolean NOT NULL DEFAULT false,
 excel_synced boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.eft_orders TO authenticated;
GRANT ALL ON public.eft_orders TO service_role;
ALTER TABLE public.eft_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_read_eft_orders ON public.eft_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX eft_orders_created_idx ON public.eft_orders(created_at DESC);