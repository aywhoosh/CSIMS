-- ============================================================================
-- CSIMS Seed Data
-- Realistic demo data for Blessing Homz Pvt Ltd construction sites
-- ============================================================================

-- ============================================================================
-- BASE DATA: Categories, Sites, Storage Locations, Suppliers, Inventory Items
-- ============================================================================

-- Categories
INSERT INTO public.categories (id, name, description) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Cement', 'Portland cement, white cement, and specialty cements'),
  ('c1000000-0000-0000-0000-000000000002', 'Steel/Rebar', 'TMT bars, structural steel, binding wire'),
  ('c1000000-0000-0000-0000-000000000003', 'Bricks/Blocks', 'Clay bricks, AAC blocks, concrete blocks'),
  ('c1000000-0000-0000-0000-000000000004', 'Sand/Aggregate', 'River sand, M-sand, crushed stone aggregate'),
  ('c1000000-0000-0000-0000-000000000005', 'Timber/Plywood', 'Shuttering plywood, form lumber, scaffolding planks'),
  ('c1000000-0000-0000-0000-000000000006', 'Pipes/Fittings', 'PVC pipes, CPVC pipes, GI pipes, fittings'),
  ('c1000000-0000-0000-0000-000000000007', 'Electrical', 'Wires, cables, switches, MCBs, panels'),
  ('c1000000-0000-0000-0000-000000000008', 'Paint/Finish', 'Interior paint, exterior paint, primer, putty'),
  ('c1000000-0000-0000-0000-000000000009', 'Hardware/Fasteners', 'Nails, screws, bolts, hinges, locks'),
  ('c1000000-0000-0000-0000-000000000010', 'Safety Equipment', 'Helmets, gloves, safety shoes, harnesses'),
  ('c1000000-0000-0000-0000-000000000011', 'Tools', 'Power tools, hand tools, measuring instruments'),
  ('c1000000-0000-0000-0000-000000000012', 'Tiles/Flooring', 'Vitrified tiles, ceramic tiles, marble, granite')
ON CONFLICT (id) DO NOTHING;

-- Sites
INSERT INTO public.sites (id, name, code, address, city, state, pincode) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Blessing Heights - Tower A & B', 'SITE-001', 'Plot No. 42, Sector 62, Blessing Heights', 'Noida', 'Uttar Pradesh', '201301'),
  ('a1000000-0000-0000-0000-000000000002', 'Blessing Greens Residency', 'SITE-002', 'Plot No. 78, Sector 104, Green Valley', 'Gurugram', 'Haryana', '122001')
ON CONFLICT (id) DO NOTHING;

-- Storage Locations
INSERT INTO public.storage_locations (id, site_id, name, description) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Main Store', 'Primary storage area near site entrance'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Tower A Ground Floor', 'Temporary storage at Tower A base'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Steel Yard', 'Open yard for steel and rebar storage'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Central Warehouse', 'Main covered warehouse'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Block C Store', 'Storage room at Block C'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Open Yard', 'Open area for aggregate and sand')
ON CONFLICT (id) DO NOTHING;

-- Suppliers
INSERT INTO public.suppliers (id, name, code, contact_person, email, phone, gst_number, address, city, state, pincode) VALUES
  ('cd100000-0000-0000-0000-000000000001', 'UltraTech Cement Dealers', 'SUP-001', 'Rajesh Sharma', 'rajesh@ultratechdelhi.com', '9876543210', '09ABCDE1234F1Z5', '45 Industrial Area, Phase 2', 'Noida', 'Uttar Pradesh', '201305'),
  ('cd100000-0000-0000-0000-000000000002', 'Tata Steel Distributors', 'SUP-002', 'Amit Verma', 'amit@tatasteel-dist.com', '9876543211', '07FGHIJ5678K2Y3', '12 Steel Market, Sector 18', 'Gurugram', 'Haryana', '122015'),
  ('cd100000-0000-0000-0000-000000000003', 'Delhi Brick Suppliers', 'SUP-003', 'Suresh Kumar', 'suresh@delhibricks.com', '9876543212', '07KLMNO9012P3X2', '89 Brick Lane, Palam', 'New Delhi', 'Delhi', '110045'),
  ('cd100000-0000-0000-0000-000000000004', 'Shree Electricals', 'SUP-004', 'Priya Gupta', 'priya@shreeelectricals.in', '9876543213', '09PQRST3456Q4W1', '23 Electrical Market, Bhagirath Palace', 'New Delhi', 'Delhi', '110006'),
  ('cd100000-0000-0000-0000-000000000005', 'Gupta Paint House', 'SUP-005', 'Manoj Gupta', 'manoj@guptapaints.com', '9876543214', '07UVWXY7890R5V9', '56 Color Street, Kirti Nagar', 'New Delhi', 'Delhi', '110015')
ON CONFLICT (id) DO NOTHING;

-- Inventory Items (Site 1 - Blessing Heights)
INSERT INTO public.inventory_items (id, name, code, category_id, site_id, storage_location_id, unit, current_stock, minimum_stock, reorder_quantity, unit_price, description) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'OPC 43 Grade Cement', 'MAT-001', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'bags', 450, 200, 500, 380, 'UltraTech OPC 43 Grade - 50kg bags'),
  ('e1000000-0000-0000-0000-000000000002', 'PPC Cement', 'MAT-002', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'bags', 120, 150, 300, 360, 'Portland Pozzolana Cement - 50kg bags'),
  ('e1000000-0000-0000-0000-000000000003', 'TMT Steel Bar 12mm', 'MAT-003', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'tonnes', 8.5, 5, 10, 62000, 'Fe-500D TMT bars, 12mm diameter'),
  ('e1000000-0000-0000-0000-000000000004', 'TMT Steel Bar 16mm', 'MAT-004', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'tonnes', 3.2, 5, 10, 61000, 'Fe-500D TMT bars, 16mm diameter'),
  ('e1000000-0000-0000-0000-000000000005', 'Red Clay Bricks', 'MAT-005', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'pcs', 25000, 10000, 20000, 8, 'Standard size red clay bricks'),
  ('e1000000-0000-0000-0000-000000000006', 'AAC Blocks 600x200x150', 'MAT-006', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'pcs', 3500, 2000, 5000, 55, 'Autoclaved Aerated Concrete blocks'),
  ('e1000000-0000-0000-0000-000000000007', 'River Sand', 'MAT-007', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'cu.m', 35, 20, 40, 2800, 'Fine river sand for plastering'),
  ('e1000000-0000-0000-0000-000000000008', 'Crushed Stone 20mm', 'MAT-008', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'cu.m', 42, 25, 50, 1800, '20mm graded crushed stone aggregate'),
  ('e1000000-0000-0000-0000-000000000009', 'Shuttering Plywood 18mm', 'MAT-009', 'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'pcs', 80, 30, 50, 1450, 'Film-faced shuttering plywood sheets'),
  ('e1000000-0000-0000-0000-000000000010', 'PVC Pipe 4 inch', 'MAT-010', 'c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'metres', 200, 100, 200, 185, 'Astral PVC SWR pipes, 110mm'),
  ('e1000000-0000-0000-0000-000000000011', 'Copper Wire 2.5mm', 'MAT-011', 'c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'metres', 1500, 500, 1000, 28, 'Polycab FR copper wire, 2.5 sq mm'),
  ('e1000000-0000-0000-0000-000000000012', 'Asian Paints Primer', 'MAT-012', 'c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'litres', 100, 50, 100, 140, 'Asian Paints exterior primer, white'),
  ('e1000000-0000-0000-0000-000000000013', 'Safety Helmets', 'MAT-013', 'c1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'pcs', 45, 20, 30, 250, 'ISI marked safety helmets, yellow'),
  ('e1000000-0000-0000-0000-000000000014', 'Binding Wire', 'MAT-014', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'kg', 150, 100, 200, 72, '18 gauge GI binding wire'),
  ('e1000000-0000-0000-0000-000000000015', 'GI Nails 3 inch', 'MAT-015', 'c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'kg', 25, 10, 25, 95, 'Galvanized iron wire nails'),
  ('e1000000-0000-0000-0000-000000000016', 'Vitrified Floor Tiles', 'MAT-016', 'c1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'sq.m', 0, 100, 200, 580, 'Kajaria vitrified tiles 600x600mm'),
  -- Site 2 - Blessing Greens
  ('e1000000-0000-0000-0000-000000000017', 'OPC 53 Grade Cement', 'MAT-017', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'bags', 300, 150, 400, 400, 'UltraTech OPC 53 Grade - 50kg bags'),
  ('e1000000-0000-0000-0000-000000000018', 'TMT Steel Bar 10mm', 'MAT-018', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 'tonnes', 6, 3, 8, 63000, 'Fe-500D TMT bars, 10mm diameter'),
  ('e1000000-0000-0000-0000-000000000019', 'M-Sand', 'MAT-019', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 'cu.m', 50, 30, 60, 2200, 'Manufactured sand, Zone II graded'),
  ('e1000000-0000-0000-0000-000000000020', 'CPVC Pipe 1 inch', 'MAT-020', 'c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'metres', 80, 50, 150, 210, 'Astral CPVC pipes for hot water')
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- TRANSACTIONAL DEMO DATA
-- Purchase Orders, PO Items, Inventory Transactions, Invoices, Payments,
-- Stock Audits, and Stock Audit Items.
--
-- These records reference profiles(id) via created_by / performed_by /
-- recorded_by / conducted_by / reviewed_by columns.  We look up the first
-- available profile.  If none exists yet (no user has signed up), only the
-- base data above is seeded.  Re-run this file after creating your first
-- user account to populate transactional data.
-- ============================================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- ------------------------------------------------------------------
  -- 1. Resolve a profile to use as FK for all user-referencing columns
  -- ------------------------------------------------------------------
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '---------------------------------------------------------------';
    RAISE NOTICE 'No user profile found. Skipping transactional seed data.';
    RAISE NOTICE 'Sign up in the app first, then re-run this seed to populate';
    RAISE NOTICE 'purchase orders, transactions, invoices, payments, and audits.';
    RAISE NOTICE '---------------------------------------------------------------';
    RETURN;
  END IF;

  RAISE NOTICE 'Found profile %. Seeding transactional data...', v_user_id;

  -- ==================================================================
  -- 2. PURCHASE ORDERS
  -- ==================================================================

  -- PO-001: UltraTech -> Site 1 | OPC 43 + PPC cement | received | 25 days ago
  INSERT INTO public.purchase_orders (
    id, po_number, site_id, supplier_id, status, order_date,
    expected_delivery_date, delivery_address,
    subtotal, tax_amount, total_amount, notes,
    created_by, approved_by
  ) VALUES (
    'da100000-0000-0000-0000-000000000001', 'PO-001',
    'a1000000-0000-0000-0000-000000000001',
    'cd100000-0000-0000-0000-000000000001',
    'received',
    CURRENT_DATE - 25, CURRENT_DATE - 20,
    'Plot No. 42, Sector 62, Blessing Heights, Noida',
    296610.17, 53389.83, 350000.00,
    'Urgent cement requirement for Tower A slab casting. Delivery in two lots.',
    v_user_id, v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PO-002: Tata Steel -> Site 1 | TMT 12mm + 16mm + Binding Wire | partially_received | 20 days ago
  INSERT INTO public.purchase_orders (
    id, po_number, site_id, supplier_id, status, order_date,
    expected_delivery_date, delivery_address,
    subtotal, tax_amount, total_amount, notes,
    created_by, approved_by
  ) VALUES (
    'da100000-0000-0000-0000-000000000002', 'PO-002',
    'a1000000-0000-0000-0000-000000000001',
    'cd100000-0000-0000-0000-000000000002',
    'partially_received',
    CURRENT_DATE - 20, CURRENT_DATE - 12,
    'Plot No. 42, Sector 62, Blessing Heights, Noida - Steel Yard',
    720339.00, 129661.20, 850000.20,
    'Steel for 5th floor columns and beams. Delivery scheduled in two lots.',
    v_user_id, v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PO-003: Delhi Brick -> Site 1 | Red Bricks + AAC Blocks | sent | 15 days ago
  INSERT INTO public.purchase_orders (
    id, po_number, site_id, supplier_id, status, order_date,
    expected_delivery_date, delivery_address,
    subtotal, tax_amount, total_amount, notes,
    created_by, approved_by
  ) VALUES (
    'da100000-0000-0000-0000-000000000003', 'PO-003',
    'a1000000-0000-0000-0000-000000000001',
    'cd100000-0000-0000-0000-000000000003',
    'sent',
    CURRENT_DATE - 15, CURRENT_DATE - 5,
    'Plot No. 42, Sector 62, Blessing Heights, Noida - Tower A Ground Floor',
    332627.12, 59872.88, 392500.00,
    'Bricks and blocks for 4th floor partition walls. Awaiting delivery.',
    v_user_id, v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PO-004: UltraTech -> Site 2 | OPC 53 | received | 18 days ago
  INSERT INTO public.purchase_orders (
    id, po_number, site_id, supplier_id, status, order_date,
    expected_delivery_date, delivery_address,
    subtotal, tax_amount, total_amount, notes,
    created_by, approved_by
  ) VALUES (
    'da100000-0000-0000-0000-000000000004', 'PO-004',
    'a1000000-0000-0000-0000-000000000002',
    'cd100000-0000-0000-0000-000000000001',
    'received',
    CURRENT_DATE - 18, CURRENT_DATE - 13,
    'Plot No. 78, Sector 104, Green Valley, Gurugram - Central Warehouse',
    135593.22, 24406.78, 160000.00,
    'Cement for foundation work, Block D.',
    v_user_id, v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PO-005: Shree Electricals -> Site 1 | Copper Wire + PVC Pipe | draft | 3 days ago
  INSERT INTO public.purchase_orders (
    id, po_number, site_id, supplier_id, status, order_date,
    expected_delivery_date, delivery_address,
    subtotal, tax_amount, total_amount, notes,
    created_by
  ) VALUES (
    'da100000-0000-0000-0000-000000000005', 'PO-005',
    'a1000000-0000-0000-0000-000000000001',
    'cd100000-0000-0000-0000-000000000004',
    'draft',
    CURRENT_DATE - 3, CURRENT_DATE + 7,
    'Plot No. 42, Sector 62, Blessing Heights, Noida - Main Store',
    66949.15, 12050.85, 79000.00,
    'Electrical supplies for Tower B wiring phase. Awaiting manager approval.',
    v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PO-006: Gupta Paint -> Site 1 | Primer | sent | 7 days ago
  INSERT INTO public.purchase_orders (
    id, po_number, site_id, supplier_id, status, order_date,
    expected_delivery_date, delivery_address,
    subtotal, tax_amount, total_amount, notes,
    created_by, approved_by
  ) VALUES (
    'da100000-0000-0000-0000-000000000006', 'PO-006',
    'a1000000-0000-0000-0000-000000000001',
    'cd100000-0000-0000-0000-000000000005',
    'sent',
    CURRENT_DATE - 7, CURRENT_DATE + 3,
    'Plot No. 42, Sector 62, Blessing Heights, Noida - Main Store',
    11864.41, 2135.59, 14000.00,
    'Exterior primer for Tower A facade, floors 1-3.',
    v_user_id, v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- 3. PURCHASE ORDER ITEMS
  -- ==================================================================

  -- PO-001 items: OPC 43 (500 bags x 380) + PPC (300 bags x 360)
  INSERT INTO public.purchase_order_items
    (id, purchase_order_id, item_id, quantity_ordered, quantity_received, unit_price, tax_percent, total_price)
  VALUES
    ('de100000-0000-0000-0000-000000000001',
     'da100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000001',
     500, 500, 380.00, 18.00, 224200.00),
    ('de100000-0000-0000-0000-000000000002',
     'da100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000002',
     300, 300, 360.00, 18.00, 127440.00)
  ON CONFLICT (id) DO NOTHING;

  -- PO-002 items: TMT 12mm (5T x 62000) + TMT 16mm (5T x 61000) + Binding Wire (200kg x 72)
  INSERT INTO public.purchase_order_items
    (id, purchase_order_id, item_id, quantity_ordered, quantity_received, unit_price, tax_percent, total_price)
  VALUES
    ('de100000-0000-0000-0000-000000000003',
     'da100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000003',
     5, 3, 62000.00, 18.00, 365800.00),
    ('de100000-0000-0000-0000-000000000004',
     'da100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000004',
     5, 2, 61000.00, 18.00, 359900.00),
    ('de100000-0000-0000-0000-000000000005',
     'da100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000014',
     200, 150, 72.00, 18.00, 16992.00)
  ON CONFLICT (id) DO NOTHING;

  -- PO-003 items: Red Bricks (15000 pcs x 8) + AAC Blocks (5000 pcs x 55)
  INSERT INTO public.purchase_order_items
    (id, purchase_order_id, item_id, quantity_ordered, quantity_received, unit_price, tax_percent, total_price)
  VALUES
    ('de100000-0000-0000-0000-000000000006',
     'da100000-0000-0000-0000-000000000003',
     'e1000000-0000-0000-0000-000000000005',
     15000, 0, 8.00, 18.00, 141600.00),
    ('de100000-0000-0000-0000-000000000007',
     'da100000-0000-0000-0000-000000000003',
     'e1000000-0000-0000-0000-000000000006',
     5000, 0, 55.00, 18.00, 324500.00)
  ON CONFLICT (id) DO NOTHING;

  -- PO-004 items: OPC 53 (400 bags x 400)
  INSERT INTO public.purchase_order_items
    (id, purchase_order_id, item_id, quantity_ordered, quantity_received, unit_price, tax_percent, total_price)
  VALUES
    ('de100000-0000-0000-0000-000000000008',
     'da100000-0000-0000-0000-000000000004',
     'e1000000-0000-0000-0000-000000000017',
     400, 400, 400.00, 0.00, 160000.00)
  ON CONFLICT (id) DO NOTHING;

  -- PO-005 items: Copper Wire (1000m x 28) + PVC Pipe (300m x 185)
  INSERT INTO public.purchase_order_items
    (id, purchase_order_id, item_id, quantity_ordered, quantity_received, unit_price, tax_percent, total_price)
  VALUES
    ('de100000-0000-0000-0000-000000000009',
     'da100000-0000-0000-0000-000000000005',
     'e1000000-0000-0000-0000-000000000011',
     1000, 0, 28.00, 18.00, 33040.00),
    ('de100000-0000-0000-0000-000000000010',
     'da100000-0000-0000-0000-000000000005',
     'e1000000-0000-0000-0000-000000000010',
     300, 0, 185.00, 18.00, 65490.00)
  ON CONFLICT (id) DO NOTHING;

  -- PO-006 items: Primer (100 litres x 140)
  INSERT INTO public.purchase_order_items
    (id, purchase_order_id, item_id, quantity_ordered, quantity_received, unit_price, tax_percent, total_price)
  VALUES
    ('de100000-0000-0000-0000-000000000011',
     'da100000-0000-0000-0000-000000000006',
     'e1000000-0000-0000-0000-000000000012',
     100, 0, 140.00, 0.00, 14000.00)
  ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- 4. INVENTORY TRANSACTIONS
  --    Disable triggers to avoid double-counting stock adjustments
  -- ==================================================================
  SET session_replication_role = 'replica';

  -- ---- Day-28: OPC 43 cement first lot (PO-001) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000001', 'TXN-001',
    'e1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 300, 5, 380.00,
    'da100000-0000-0000-0000-000000000001',
    'CH-2026-001', 'UP-32-AB-1234',
    'First lot of OPC 43. 5 bags damaged in transit, rejected at gate.',
    v_user_id, CURRENT_DATE - 28
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-25: OPC 43 cement second lot (PO-001) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000002', 'TXN-002',
    'e1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 200, 0, 380.00,
    'da100000-0000-0000-0000-000000000001',
    'CH-2026-002', 'UP-32-AB-1234',
    'Second lot of OPC 43. All bags in good condition.',
    v_user_id, CURRENT_DATE - 25
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-25: PPC cement delivery (PO-001) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000003', 'TXN-003',
    'e1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 300, 0, 360.00,
    'da100000-0000-0000-0000-000000000001',
    'CH-2026-003', 'UP-32-CD-5678',
    'PPC cement full delivery. Quality verified.',
    v_user_id, CURRENT_DATE - 25
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-24: Cement issued to mason team (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000004', 'TXN-004',
    'e1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 50, 0, 380.00,
    'Tower A - Mason Team (Rajendra)', 'Column casting, 4th floor',
    'Issued for column work. Indent approved by site engineer.',
    v_user_id, CURRENT_DATE - 24
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-22: TMT 12mm first lot (PO-002) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000005', 'TXN-005',
    'e1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 3, 0, 62000.00,
    'da100000-0000-0000-0000-000000000002',
    'CH-2026-004', 'HR-26-EF-9012',
    'TMT 12mm first lot. Weight verified at weighbridge.',
    v_user_id, CURRENT_DATE - 22
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-20: TMT 16mm partial delivery (PO-002) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000006', 'TXN-006',
    'e1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 2, 0, 61000.00,
    'da100000-0000-0000-0000-000000000002',
    'CH-2026-005', 'HR-26-EF-9012',
    'TMT 16mm partial delivery. 3 tonnes still pending from supplier.',
    v_user_id, CURRENT_DATE - 20
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-20: Binding wire delivery (PO-002) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000007', 'TXN-007',
    'e1000000-0000-0000-0000-000000000014',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 150, 0, 72.00,
    'da100000-0000-0000-0000-000000000002',
    'CH-2026-006', 'HR-26-EF-9012',
    'Binding wire 150 kg received. 50 kg pending on next delivery.',
    v_user_id, CURRENT_DATE - 20
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-18: OPC 53 delivery to Site 2 (PO-004) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, purchase_order_id, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000008', 'TXN-008',
    'e1000000-0000-0000-0000-000000000017',
    'a1000000-0000-0000-0000-000000000002',
    'inward', 400, 3, 400.00,
    'da100000-0000-0000-0000-000000000004',
    'CH-2026-007', 'HR-55-GH-3456',
    'OPC 53 full lot. 3 bags had hardened cement, rejected.',
    v_user_id, CURRENT_DATE - 18
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-17: TMT 12mm issued to formwork team (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000009', 'TXN-009',
    'e1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 1.5, 0, 62000.00,
    'Tower A - Formwork Team (Sunil)', '5th floor beam reinforcement',
    'TMT 12mm issued. Bar bending schedule ref: BBS-TA-05-003.',
    v_user_id, CURRENT_DATE - 17
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-16: River sand spot purchase (no PO) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000010', 'TXN-010',
    'e1000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 20, 0, 2800.00,
    'CH-2026-008', 'UP-78-JK-7890',
    'Spot purchase river sand. Sieve analysis passed, Zone II.',
    v_user_id, CURRENT_DATE - 16
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-15: Crushed stone delivery ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000011', 'TXN-011',
    'e1000000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 25, 0, 1800.00,
    'CH-2026-009', 'UP-78-JK-7890',
    '20mm aggregate for RCC work. Volume measured by surveyor.',
    v_user_id, CURRENT_DATE - 15
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-14: OPC 43 issued for slab casting (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000012', 'TXN-012',
    'e1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 100, 0, 380.00,
    'Tower A - RCC Team (Vikram)', '4th floor slab casting',
    'Bulk cement issue for slab. Batching plant consumption log ref: BP-042.',
    v_user_id, CURRENT_DATE - 14
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-14: River sand issued for slab casting (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000013', 'TXN-013',
    'e1000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 10, 0, 2800.00,
    'Tower A - RCC Team (Vikram)', '4th floor slab casting',
    'Sand for concrete mix. Same slab pour as TXN-012.',
    v_user_id, CURRENT_DATE - 14
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-13: PPC cement issued for brickwork (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000014', 'TXN-014',
    'e1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 80, 0, 360.00,
    'Tower B - Mason Team (Dinesh)', '3rd floor brick partition walls',
    'PPC cement for mortar mix. Estimated consumption 80 bags for 3rd floor walls.',
    v_user_id, CURRENT_DATE - 13
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-12: OPC 53 issued at Site 2 (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000015', 'TXN-015',
    'e1000000-0000-0000-0000-000000000017',
    'a1000000-0000-0000-0000-000000000002',
    'outward', 100, 0, 400.00,
    'Block D - Foundation Team (Hari)', 'Foundation concrete, Block D',
    'Cement for footing concrete as per structural drawing.',
    v_user_id, CURRENT_DATE - 12
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-10: Shuttering plywood issued (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000016', 'TXN-016',
    'e1000000-0000-0000-0000-000000000009',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 20, 0, 1450.00,
    'Tower A - Shuttering Team (Babu)', '5th floor column shuttering',
    'Plywood sheets for column formwork. To be returned after de-shuttering.',
    v_user_id, CURRENT_DATE - 10
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-9: Copper wire spot purchase (inward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000017', 'TXN-017',
    'e1000000-0000-0000-0000-000000000011',
    'a1000000-0000-0000-0000-000000000001',
    'inward', 500, 0, 28.00,
    'CH-2026-010', 'DL-01-MN-4567',
    'Emergency purchase copper wire for Tower A electrical conduit work.',
    v_user_id, CURRENT_DATE - 9
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-8: Copper wire issued to electricians (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000018', 'TXN-018',
    'e1000000-0000-0000-0000-000000000011',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 300, 0, 28.00,
    'Tower A - Electrician Team (Ravi)', '3rd floor wiring, flats 301-308',
    'Wiring for living room and bedroom circuits.',
    v_user_id, CURRENT_DATE - 8
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-7: PVC pipe issued to plumbers (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000019', 'TXN-019',
    'e1000000-0000-0000-0000-000000000010',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 50, 0, 185.00,
    'Tower A - Plumbing Team (Santosh)', 'Drainage line, 3rd and 4th floor',
    'PVC SWR pipes for drainage stack and branch lines.',
    v_user_id, CURRENT_DATE - 7
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-6: M-Sand delivery to Site 2 (inward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000020', 'TXN-020',
    'e1000000-0000-0000-0000-000000000019',
    'a1000000-0000-0000-0000-000000000002',
    'inward', 30, 0, 2200.00,
    'CH-2026-011', 'HR-55-PQ-8901',
    'M-Sand for Block D plastering and brickwork.',
    v_user_id, CURRENT_DATE - 6
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-5: GI nails issued for carpentry (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000021', 'TXN-021',
    'e1000000-0000-0000-0000-000000000015',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 8, 0, 95.00,
    'Tower A - Carpentry Team (Mohan)', 'Door frame installation, 2nd floor',
    'GI nails for door frame fixing and chowkhats.',
    v_user_id, CURRENT_DATE - 5
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-4: Safety helmets issued (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000022', 'TXN-022',
    'e1000000-0000-0000-0000-000000000013',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 10, 0, 250.00,
    'Site Safety Officer (Rakesh)', 'New worker safety kit issuance',
    'Helmets for new batch of labourers. Safety induction completed.',
    v_user_id, CURRENT_DATE - 4
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-3: CPVC pipe delivery to Site 2 (inward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, challan_number, vehicle_number,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000023', 'TXN-023',
    'e1000000-0000-0000-0000-000000000020',
    'a1000000-0000-0000-0000-000000000002',
    'inward', 100, 0, 210.00,
    'CH-2026-012', 'HR-55-RS-2345',
    'CPVC pipe for hot water lines, Block C bathrooms.',
    v_user_id, CURRENT_DATE - 3
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-2: TMT 10mm issued at Site 2 (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000024', 'TXN-024',
    'e1000000-0000-0000-0000-000000000018',
    'a1000000-0000-0000-0000-000000000002',
    'outward', 2, 0, 63000.00,
    'Block D - Bar Bending Team (Kallu)', 'Slab reinforcement, Block D ground floor',
    'TMT 10mm for slab mesh as per BBS.',
    v_user_id, CURRENT_DATE - 2
  ) ON CONFLICT (id) DO NOTHING;

  -- ---- Day-1: Binding wire issued (outward) ----
  INSERT INTO public.inventory_transactions (
    id, transaction_number, item_id, site_id, type, quantity, rejected_quantity,
    unit_price, issued_to, purpose,
    remarks, performed_by, transaction_date
  ) VALUES (
    'cf100000-0000-0000-0000-000000000025', 'TXN-025',
    'e1000000-0000-0000-0000-000000000014',
    'a1000000-0000-0000-0000-000000000001',
    'outward', 30, 0, 72.00,
    'Tower A - Bar Bending Team (Pappu)', '5th floor column tying',
    'Binding wire for rebar tying work.',
    v_user_id, CURRENT_DATE - 1
  ) ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- 5. INVOICES
  -- ==================================================================

  -- INV-001: PO-001, UltraTech, 3,50,000, fully paid
  INSERT INTO public.invoices (
    id, invoice_number, purchase_order_id, supplier_id, site_id,
    invoice_date, due_date,
    subtotal, tax_amount, total_amount, amount_paid,
    status, notes
  ) VALUES (
    'eb100000-0000-0000-0000-000000000001', 'INV-001',
    'da100000-0000-0000-0000-000000000001',
    'cd100000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 24, CURRENT_DATE - 10,
    296610.17, 53389.83, 350000.00, 350000.00,
    'paid',
    'Invoice for OPC 43 and PPC cement (PO-001). Fully settled via two NEFT payments.'
  ) ON CONFLICT (id) DO NOTHING;

  -- INV-002: PO-002, Tata Steel, 8,50,000, partially paid (4,00,000)
  INSERT INTO public.invoices (
    id, invoice_number, purchase_order_id, supplier_id, site_id,
    invoice_date, due_date,
    subtotal, tax_amount, total_amount, amount_paid,
    status, notes
  ) VALUES (
    'eb100000-0000-0000-0000-000000000002', 'INV-002',
    'da100000-0000-0000-0000-000000000002',
    'cd100000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 19, CURRENT_DATE + 10,
    720338.98, 129661.02, 850000.00, 400000.00,
    'partially_paid',
    'TMT bars and binding wire (PO-002). Balance 4,50,000 due after final delivery.'
  ) ON CONFLICT (id) DO NOTHING;

  -- INV-003: PO-004, UltraTech, 1,60,000, pending (overdue - due 5 days ago)
  INSERT INTO public.invoices (
    id, invoice_number, purchase_order_id, supplier_id, site_id,
    invoice_date, due_date,
    subtotal, tax_amount, total_amount, amount_paid,
    status, notes
  ) VALUES (
    'eb100000-0000-0000-0000-000000000003', 'INV-003',
    'da100000-0000-0000-0000-000000000004',
    'cd100000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    CURRENT_DATE - 17, CURRENT_DATE - 5,
    135593.22, 24406.78, 160000.00, 0.00,
    'pending',
    'OPC 53 for Blessing Greens (PO-004). OVERDUE - follow up with accounts department.'
  ) ON CONFLICT (id) DO NOTHING;

  -- INV-004: Delhi Brick, 2,00,000, pending, due in 15 days
  INSERT INTO public.invoices (
    id, invoice_number, supplier_id, site_id,
    invoice_date, due_date,
    subtotal, tax_amount, total_amount, amount_paid,
    status, notes
  ) VALUES (
    'eb100000-0000-0000-0000-000000000004', 'INV-004',
    'cd100000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 8, CURRENT_DATE + 15,
    169491.53, 30508.47, 200000.00, 0.00,
    'pending',
    'Advance invoice from Delhi Brick Suppliers for upcoming brick and block delivery.'
  ) ON CONFLICT (id) DO NOTHING;

  -- INV-005: Shree Electricals, 45,000, fully paid
  INSERT INTO public.invoices (
    id, invoice_number, supplier_id, site_id,
    invoice_date, due_date,
    subtotal, tax_amount, total_amount, amount_paid,
    status, notes
  ) VALUES (
    'eb100000-0000-0000-0000-000000000005', 'INV-005',
    'cd100000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 10, CURRENT_DATE + 5,
    38135.59, 6864.41, 45000.00, 45000.00,
    'paid',
    'Copper wire and electrical accessories. Paid in two UPI instalments.'
  ) ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- 6. PAYMENTS
  -- ==================================================================

  -- PAY-001: INV-001, 2,00,000, bank_transfer, 20 days ago
  INSERT INTO public.payments (
    id, invoice_id, payment_number, amount, payment_date,
    payment_method, reference_number, notes, recorded_by
  ) VALUES (
    'db100000-0000-0000-0000-000000000001',
    'eb100000-0000-0000-0000-000000000001',
    'PAY-001', 200000.00, CURRENT_DATE - 20,
    'bank_transfer', 'NEFT-REF-20260216-001',
    'First payment to UltraTech for cement delivery (INV-001).',
    v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PAY-002: INV-001, 1,50,000, bank_transfer, 15 days ago
  INSERT INTO public.payments (
    id, invoice_id, payment_number, amount, payment_date,
    payment_method, reference_number, notes, recorded_by
  ) VALUES (
    'db100000-0000-0000-0000-000000000002',
    'eb100000-0000-0000-0000-000000000001',
    'PAY-002', 150000.00, CURRENT_DATE - 15,
    'bank_transfer', 'NEFT-REF-20260221-002',
    'Final settlement for INV-001. UltraTech account cleared.',
    v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PAY-003: INV-002, 4,00,000, cheque, 12 days ago
  INSERT INTO public.payments (
    id, invoice_id, payment_number, amount, payment_date,
    payment_method, reference_number, notes, recorded_by
  ) VALUES (
    'db100000-0000-0000-0000-000000000003',
    'eb100000-0000-0000-0000-000000000002',
    'PAY-003', 400000.00, CURRENT_DATE - 12,
    'cheque', 'CHQ-SBI-784521',
    'Partial payment to Tata Steel (INV-002). Balance 4,50,000 pending.',
    v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PAY-004: INV-005, 25,000, upi, 8 days ago
  INSERT INTO public.payments (
    id, invoice_id, payment_number, amount, payment_date,
    payment_method, reference_number, notes, recorded_by
  ) VALUES (
    'db100000-0000-0000-0000-000000000004',
    'eb100000-0000-0000-0000-000000000005',
    'PAY-004', 25000.00, CURRENT_DATE - 8,
    'upi', 'UPI-REF-326718294501',
    'First UPI payment to Shree Electricals (INV-005).',
    v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- PAY-005: INV-005, 20,000, upi, 5 days ago
  INSERT INTO public.payments (
    id, invoice_id, payment_number, amount, payment_date,
    payment_method, reference_number, notes, recorded_by
  ) VALUES (
    'db100000-0000-0000-0000-000000000005',
    'eb100000-0000-0000-0000-000000000005',
    'PAY-005', 20000.00, CURRENT_DATE - 5,
    'upi', 'UPI-REF-326891034782',
    'Final UPI payment to Shree Electricals. INV-005 fully settled.',
    v_user_id
  ) ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- 7. STOCK AUDITS
  -- ==================================================================

  -- AUD-001: Site 1, 10 days ago, completed with review
  INSERT INTO public.stock_audits (
    id, audit_number, site_id, audit_date, status,
    conducted_by, reviewed_by, notes
  ) VALUES (
    'a0100000-0000-0000-0000-000000000001', 'AUD-001',
    'a1000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 10, 'completed',
    v_user_id, v_user_id,
    'Monthly stock verification for Blessing Heights. Minor variances in cement and bricks. Overall inventory in good order.'
  ) ON CONFLICT (id) DO NOTHING;

  -- AUD-002: Site 2, 3 days ago, in_progress (not yet reviewed)
  INSERT INTO public.stock_audits (
    id, audit_number, site_id, audit_date, status,
    conducted_by, notes
  ) VALUES (
    'a0100000-0000-0000-0000-000000000002', 'AUD-002',
    'a1000000-0000-0000-0000-000000000002',
    CURRENT_DATE - 3, 'in_progress',
    v_user_id,
    'Bi-weekly audit for Blessing Greens. Checking cement, steel, sand, and pipes. Pending review by project manager.'
  ) ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- 8. STOCK AUDIT ITEMS
  -- ==================================================================

  -- AUD-001 items (Site 1) - 6 items with realistic variances
  INSERT INTO public.stock_audit_items
    (id, audit_id, item_id, system_quantity, physical_quantity, variance_reason)
  VALUES
    -- OPC 43: system 450, physical 445 (-5 bags, handling wastage)
    ('ae100000-0000-0000-0000-000000000001',
     'a0100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000001',
     450, 445,
     'Minor wastage during handling. 5 bags found torn or partially used near batching plant.'),
    -- PPC Cement: system 120, physical 120 (no variance)
    ('ae100000-0000-0000-0000-000000000002',
     'a0100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000002',
     120, 120,
     NULL),
    -- TMT 12mm: system 8.5, physical 8.4 (-0.1T, weighbridge tolerance)
    ('ae100000-0000-0000-0000-000000000003',
     'a0100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000003',
     8.5, 8.4,
     'Weighbridge measurement shows 0.1T less. Within acceptable 1.2% tolerance.'),
    -- Red Bricks: system 25000, physical 24850 (-150 pcs, breakage)
    ('ae100000-0000-0000-0000-000000000004',
     'a0100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000005',
     25000, 24850,
     'Approximately 150 bricks broken during unloading and stacking. Recommend write-off.'),
    -- River Sand: system 35, physical 34 (-1 cu.m, settling)
    ('ae100000-0000-0000-0000-000000000005',
     'a0100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000007',
     35, 34,
     'Volume estimation variance. Sand settling and moisture evaporation after rain.'),
    -- Copper Wire: system 1500, physical 1510 (+10m, rounding on issuance)
    ('ae100000-0000-0000-0000-000000000006',
     'a0100000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000011',
     1500, 1510,
     'Physical count slightly higher. Likely measurement rounding during previous issuances.')
  ON CONFLICT (id) DO NOTHING;

  -- AUD-002 items (Site 2) - 4 items
  INSERT INTO public.stock_audit_items
    (id, audit_id, item_id, system_quantity, physical_quantity, variance_reason)
  VALUES
    -- OPC 53: system 300, physical 298 (-2 bags, moisture damage)
    ('ae100000-0000-0000-0000-000000000007',
     'a0100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000017',
     300, 298,
     'Two bags found with hardened cement due to moisture ingress. Marked as damaged.'),
    -- TMT 10mm: system 6, physical 6 (no variance)
    ('ae100000-0000-0000-0000-000000000008',
     'a0100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000018',
     6, 6,
     NULL),
    -- M-Sand: system 50, physical 48 (-2 cu.m, rain settling)
    ('ae100000-0000-0000-0000-000000000009',
     'a0100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000019',
     50, 48,
     'Volume variance after recent rainfall. Sand heap has compacted and settled.'),
    -- CPVC Pipe: system 80, physical 80 (no variance)
    ('ae100000-0000-0000-0000-000000000010',
     'a0100000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000020',
     80, 80,
     NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ==================================================================
  -- Re-enable triggers after transaction inserts
  -- ==================================================================
  SET session_replication_role = 'origin';

  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'Transactional seed data inserted successfully.';
  RAISE NOTICE '  6 Purchase Orders with 11 line items';
  RAISE NOTICE '  25 Inventory Transactions (inward + outward)';
  RAISE NOTICE '  5 Invoices (paid, partially_paid, pending/overdue)';
  RAISE NOTICE '  5 Payments (bank_transfer, cheque, upi)';
  RAISE NOTICE '  2 Stock Audits with 10 audit items';
  RAISE NOTICE '--------------------------------------------------------------';
END;
$$;
