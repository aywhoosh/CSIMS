-- CSIMS Database Schema: Tables
-- Construction Site Inventory Management System

-- Sites
CREATE TABLE public.sites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text NOT NULL UNIQUE,
  address     text,
  city        text,
  state       text,
  pincode     text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sites_code ON public.sites (code);

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  email       text NOT NULL,
  phone       text,
  role        public.user_role NOT NULL DEFAULT 'store_keeper',
  site_id     uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  avatar_url  text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_site_id ON public.profiles (site_id);

-- Categories
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Storage Locations
CREATE TABLE public.storage_locations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, name)
);

CREATE INDEX idx_storage_locations_site_id ON public.storage_locations (site_id);

-- Suppliers
CREATE TABLE public.suppliers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  code                text NOT NULL UNIQUE,
  contact_person      text,
  email               text,
  phone               text NOT NULL,
  alternate_phone     text,
  gst_number          text,
  pan_number          text,
  address             text,
  city                text,
  state               text,
  pincode             text,
  bank_name           text,
  bank_account_number text,
  bank_ifsc           text,
  is_active           boolean NOT NULL DEFAULT true,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_code ON public.suppliers (code);

-- Inventory Items
CREATE TABLE public.inventory_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  code                 text NOT NULL UNIQUE,
  category_id          uuid NOT NULL REFERENCES public.categories(id),
  site_id              uuid NOT NULL REFERENCES public.sites(id),
  storage_location_id  uuid REFERENCES public.storage_locations(id),
  unit                 text NOT NULL,
  current_stock        numeric(12,3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock        numeric(12,3) NOT NULL DEFAULT 0,
  reorder_quantity     numeric(12,3) NOT NULL DEFAULT 0,
  unit_price           numeric(12,2) NOT NULL DEFAULT 0,
  description          text,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_items_site_id ON public.inventory_items (site_id);
CREATE INDEX idx_inventory_items_category_id ON public.inventory_items (category_id);
CREATE INDEX idx_inventory_items_code ON public.inventory_items (code);

-- Purchase Orders (created before transactions so FK works)
CREATE TABLE public.purchase_orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number               text NOT NULL UNIQUE,
  site_id                 uuid NOT NULL REFERENCES public.sites(id),
  supplier_id             uuid NOT NULL REFERENCES public.suppliers(id),
  status                  public.po_status NOT NULL DEFAULT 'draft',
  order_date              date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date  date,
  delivery_address        text,
  subtotal                numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount              numeric(14,2) NOT NULL DEFAULT 0,
  total_amount            numeric(14,2) NOT NULL DEFAULT 0,
  notes                   text,
  created_by              uuid NOT NULL REFERENCES public.profiles(id),
  approved_by             uuid REFERENCES public.profiles(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_po_supplier_id ON public.purchase_orders (supplier_id);
CREATE INDEX idx_po_status ON public.purchase_orders (status);

-- Purchase Order Items
CREATE TABLE public.purchase_order_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id  uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id            uuid NOT NULL REFERENCES public.inventory_items(id),
  quantity_ordered   numeric(12,3) NOT NULL CHECK (quantity_ordered > 0),
  quantity_received  numeric(12,3) NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  unit_price         numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  tax_percent        numeric(5,2) NOT NULL DEFAULT 0 CHECK (tax_percent >= 0),
  total_price        numeric(14,2) NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(purchase_order_id, item_id)
);

CREATE INDEX idx_po_items_po_id ON public.purchase_order_items (purchase_order_id);

-- Inventory Transactions
CREATE TABLE public.inventory_transactions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number   text NOT NULL UNIQUE,
  item_id              uuid NOT NULL REFERENCES public.inventory_items(id),
  site_id              uuid NOT NULL REFERENCES public.sites(id),
  type                 public.transaction_type NOT NULL,
  quantity             numeric(12,3) NOT NULL CHECK (quantity > 0),
  rejected_quantity    numeric(12,3) NOT NULL DEFAULT 0 CHECK (rejected_quantity >= 0),
  unit_price           numeric(12,2),
  purchase_order_id    uuid REFERENCES public.purchase_orders(id),
  issued_to            text,
  purpose              text,
  challan_number       text,
  vehicle_number       text,
  remarks              text,
  performed_by         uuid NOT NULL REFERENCES public.profiles(id),
  transaction_date     date NOT NULL DEFAULT CURRENT_DATE,
  created_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_rejected_qty CHECK (
    (type = 'inward') OR (type = 'outward' AND rejected_quantity = 0)
  )
);

CREATE INDEX idx_transactions_item_id ON public.inventory_transactions (item_id);
CREATE INDEX idx_transactions_site_id ON public.inventory_transactions (site_id);
CREATE INDEX idx_transactions_type ON public.inventory_transactions (type);
CREATE INDEX idx_transactions_date ON public.inventory_transactions (transaction_date);

-- Invoices
CREATE TABLE public.invoices (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number     text NOT NULL UNIQUE,
  purchase_order_id  uuid REFERENCES public.purchase_orders(id),
  supplier_id        uuid NOT NULL REFERENCES public.suppliers(id),
  site_id            uuid NOT NULL REFERENCES public.sites(id),
  invoice_date       date NOT NULL,
  due_date           date NOT NULL,
  subtotal           numeric(14,2) NOT NULL,
  tax_amount         numeric(14,2) NOT NULL DEFAULT 0,
  total_amount       numeric(14,2) NOT NULL,
  amount_paid        numeric(14,2) NOT NULL DEFAULT 0,
  status             public.invoice_status NOT NULL DEFAULT 'pending',
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_supplier_id ON public.invoices (supplier_id);
CREATE INDEX idx_invoices_status ON public.invoices (status);
CREATE INDEX idx_invoices_due_date ON public.invoices (due_date);

-- Payments
CREATE TABLE public.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        uuid NOT NULL REFERENCES public.invoices(id),
  payment_number    text NOT NULL UNIQUE,
  amount            numeric(14,2) NOT NULL CHECK (amount > 0),
  payment_date      date NOT NULL DEFAULT CURRENT_DATE,
  payment_method    public.payment_method NOT NULL,
  reference_number  text,
  notes             text,
  recorded_by       uuid NOT NULL REFERENCES public.profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice_id ON public.payments (invoice_id);

-- Stock Audits
CREATE TABLE public.stock_audits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_number  text NOT NULL UNIQUE,
  site_id       uuid NOT NULL REFERENCES public.sites(id),
  audit_date    date NOT NULL DEFAULT CURRENT_DATE,
  status        public.audit_status NOT NULL DEFAULT 'in_progress',
  conducted_by  uuid NOT NULL REFERENCES public.profiles(id),
  reviewed_by   uuid REFERENCES public.profiles(id),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audits_site_id ON public.stock_audits (site_id);

-- Stock Audit Items
CREATE TABLE public.stock_audit_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id          uuid NOT NULL REFERENCES public.stock_audits(id) ON DELETE CASCADE,
  item_id           uuid NOT NULL REFERENCES public.inventory_items(id),
  system_quantity   numeric(12,3) NOT NULL,
  physical_quantity numeric(12,3) NOT NULL,
  variance          numeric(12,3) GENERATED ALWAYS AS (physical_quantity - system_quantity) STORED,
  variance_reason   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(audit_id, item_id)
);

CREATE INDEX idx_audit_items_audit_id ON public.stock_audit_items (audit_id);
