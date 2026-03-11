-- CSIMS Database: Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_audit_items ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_site_id()
RETURNS uuid AS $$
  SELECT site_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read all profiles, update own
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Sites: all authenticated users can read
CREATE POLICY sites_select ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY sites_admin ON public.sites FOR ALL TO authenticated USING (public.get_my_role() = 'admin');

-- Categories: all can read, admin can write
CREATE POLICY categories_select ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY categories_admin ON public.categories FOR ALL TO authenticated USING (public.get_my_role() = 'admin');

-- Storage Locations: all can read, admin/manager can write
CREATE POLICY storage_locations_select ON public.storage_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY storage_locations_write ON public.storage_locations FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- Suppliers: all can read, admin/manager can write
CREATE POLICY suppliers_select ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY suppliers_write ON public.suppliers FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- Inventory Items: all authenticated can read and write (stock updates happen via triggers)
CREATE POLICY inventory_items_select ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY inventory_items_insert ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY inventory_items_update ON public.inventory_items FOR UPDATE TO authenticated USING (true);

-- Inventory Transactions: all can read and insert
CREATE POLICY transactions_select ON public.inventory_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY transactions_insert ON public.inventory_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Purchase Orders: all can read, admin/manager can write
CREATE POLICY po_select ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY po_write ON public.purchase_orders FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- PO Items: follow parent PO access
CREATE POLICY po_items_select ON public.purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY po_items_write ON public.purchase_order_items FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- Invoices: all can read, admin/manager can write
CREATE POLICY invoices_select ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY invoices_write ON public.invoices FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- Payments: all can read, admin/manager can write
CREATE POLICY payments_select ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY payments_write ON public.payments FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- Stock Audits: all can read, admin/manager can write
CREATE POLICY audits_select ON public.stock_audits FOR SELECT TO authenticated USING (true);
CREATE POLICY audits_write ON public.stock_audits FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));

-- Stock Audit Items: follow parent audit access
CREATE POLICY audit_items_select ON public.stock_audit_items FOR SELECT TO authenticated USING (true);
CREATE POLICY audit_items_write ON public.stock_audit_items FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'site_manager'));
