ALTER TABLE public.eft_orders DROP CONSTRAINT IF EXISTS eft_orders_status_check;
ALTER TABLE public.eft_orders ADD CONSTRAINT eft_orders_status_check CHECK (status IN ('awaiting_verification','verification_required','paid','dispatched','cancelled'));
ALTER TABLE public.eft_orders
  ADD COLUMN proof_path text,
  ADD COLUMN proof_reference text,
  ADD COLUMN proof_amount numeric(12,2),
  ADD COLUMN proof_submitted_at timestamptz,
  ADD COLUMN proof_ack_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN proof_owner_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN dispatched_at timestamptz,
  ADD COLUMN dispatch_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN cancelled_at timestamptz;
COMMENT ON COLUMN public.eft_orders.owner_email_sent IS 'DEPRECATED: replaced by proof_owner_email_sent';
COMMENT ON COLUMN public.eft_orders.delivery_service IS 'DEPRECATED: delivery is included in owner-entered prices';