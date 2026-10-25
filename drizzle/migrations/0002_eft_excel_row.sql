ALTER TABLE public.eft_orders ADD COLUMN excel_row bigint GENERATED ALWAYS AS IDENTITY (START WITH 2);
CREATE UNIQUE INDEX eft_orders_excel_row_unique ON public.eft_orders(excel_row);