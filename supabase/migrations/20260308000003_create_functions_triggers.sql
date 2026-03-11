-- CSIMS Database: Functions & Triggers

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'store_keeper')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.storage_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stock_audits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update stock on inventory transaction
CREATE OR REPLACE FUNCTION public.update_stock_on_transaction()
RETURNS trigger AS $$
DECLARE
  net_qty numeric(12,3);
  new_stock numeric(12,3);
BEGIN
  IF NEW.type = 'inward' THEN
    net_qty := NEW.quantity - NEW.rejected_quantity;
  ELSE
    net_qty := -1 * NEW.quantity;
  END IF;

  UPDATE public.inventory_items
  SET current_stock = current_stock + net_qty,
      updated_at = now()
  WHERE id = NEW.item_id
  RETURNING current_stock INTO new_stock;

  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for item %. Current stock would be %', NEW.item_id, new_stock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_stock
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_transaction();

-- Update PO on receipt
CREATE OR REPLACE FUNCTION public.update_po_on_receipt()
RETURNS trigger AS $$
DECLARE
  all_received boolean;
  any_received boolean;
BEGIN
  IF NEW.purchase_order_id IS NULL OR NEW.type != 'inward' THEN
    RETURN NEW;
  END IF;

  UPDATE public.purchase_order_items
  SET quantity_received = quantity_received + (NEW.quantity - NEW.rejected_quantity)
  WHERE purchase_order_id = NEW.purchase_order_id
    AND item_id = NEW.item_id;

  SELECT
    bool_and(quantity_received >= quantity_ordered),
    bool_or(quantity_received > 0)
  INTO all_received, any_received
  FROM public.purchase_order_items
  WHERE purchase_order_id = NEW.purchase_order_id;

  UPDATE public.purchase_orders
  SET status = CASE
    WHEN all_received THEN 'received'::po_status
    WHEN any_received THEN 'partially_received'::po_status
    ELSE status
  END,
  updated_at = now()
  WHERE id = NEW.purchase_order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_po_on_receipt
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW
  WHEN (NEW.purchase_order_id IS NOT NULL AND NEW.type = 'inward')
  EXECUTE FUNCTION public.update_po_on_receipt();

-- Update invoice on payment
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment()
RETURNS trigger AS $$
DECLARE
  inv_total numeric(14,2);
  total_paid numeric(14,2);
BEGIN
  SELECT total_amount INTO inv_total
  FROM public.invoices WHERE id = NEW.invoice_id;

  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.payments WHERE invoice_id = NEW.invoice_id;

  UPDATE public.invoices
  SET amount_paid = total_paid,
      status = CASE
        WHEN total_paid >= inv_total THEN 'paid'::invoice_status
        WHEN total_paid > 0 THEN 'partially_paid'::invoice_status
        ELSE status
      END,
      updated_at = now()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_invoice_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_invoice_on_payment();

-- Recalculate stock from transactions (admin utility)
CREATE OR REPLACE FUNCTION public.recalculate_stock(p_item_id uuid)
RETURNS numeric AS $$
DECLARE
  calculated numeric(12,3);
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN type = 'inward' THEN quantity - rejected_quantity
      WHEN type = 'outward' THEN -quantity
    END
  ), 0) INTO calculated
  FROM public.inventory_transactions
  WHERE item_id = p_item_id;

  UPDATE public.inventory_items
  SET current_stock = calculated, updated_at = now()
  WHERE id = p_item_id;

  RETURN calculated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
