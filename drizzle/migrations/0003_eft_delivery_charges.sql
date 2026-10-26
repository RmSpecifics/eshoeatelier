ALTER TABLE public.eft_orders ADD COLUMN delivery_service text NOT NULL DEFAULT 'standard' CHECK (delivery_service IN ('standard','express'));
ALTER TABLE public.eft_orders ADD COLUMN delivery_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0);
COMMENT ON COLUMN public.eft_orders.total IS 'Full payable order total including the stored delivery fee for new orders.';