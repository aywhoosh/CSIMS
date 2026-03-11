"use server"

import { createClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]
}
function daysFromNow(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]
}

/**
 * Verify the caller is an admin using the user's session,
 * then return a service-role client that bypasses RLS for admin operations.
 */
async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { admin: null, error: "Not authenticated" } as const
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { admin: null, error: "Admin access required" } as const

  // Service-role client bypasses RLS — safe because we already verified admin role
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  return { admin, userId: user.id, error: null } as const
}

/** Helper: delete all rows from a table */
async function deleteAll(admin: any, table: string) {
  const { error } = await admin.from(table).delete().not("id", "is", null)
  if (error) throw new Error(`Failed to clear ${table}: ${error.message}`)
}

// ---------------------------------------------------------------------------
// getDatabaseStats
// ---------------------------------------------------------------------------

export async function getDatabaseStats() {
  const { admin, error } = await requireAdmin()
  if (error || !admin) return { items: 0, transactions: 0, purchaseOrders: 0, invoices: 0, suppliers: 0, sites: 0, audits: 0, payments: 0 }

  const [items, transactions, purchaseOrders, invoices, suppliers, sites, audits, payments] =
    await Promise.all([
      admin.from("inventory_items").select("*", { count: "exact", head: true }),
      admin.from("inventory_transactions").select("*", { count: "exact", head: true }),
      admin.from("purchase_orders").select("*", { count: "exact", head: true }),
      admin.from("invoices").select("*", { count: "exact", head: true }),
      admin.from("suppliers").select("*", { count: "exact", head: true }),
      admin.from("sites").select("*", { count: "exact", head: true }),
      admin.from("stock_audits").select("*", { count: "exact", head: true }),
      admin.from("payments").select("*", { count: "exact", head: true }),
    ])

  return {
    items: items.count ?? 0,
    transactions: transactions.count ?? 0,
    purchaseOrders: purchaseOrders.count ?? 0,
    invoices: invoices.count ?? 0,
    suppliers: suppliers.count ?? 0,
    sites: sites.count ?? 0,
    audits: audits.count ?? 0,
    payments: payments.count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// clearTransactionData — removes transactional data, resets stock to 0
// ---------------------------------------------------------------------------

export async function clearTransactionData() {
  const { admin, error } = await requireAdmin()
  if (error || !admin) return { error: error ?? "Unknown error" }

  try {
    // FK-safe delete order
    await deleteAll(admin, "stock_audit_items")
    await deleteAll(admin, "stock_audits")
    await deleteAll(admin, "payments")
    await deleteAll(admin, "invoices")
    await deleteAll(admin, "inventory_transactions")
    await deleteAll(admin, "purchase_order_items")
    await deleteAll(admin, "purchase_orders")

    // Reset all inventory stock to 0
    await admin.from("inventory_items").update({ current_stock: 0 }).not("id", "is", null)

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to clear transaction data" }
  }
}

// ---------------------------------------------------------------------------
// clearAllData — wipes everything except user profiles
// ---------------------------------------------------------------------------

export async function clearAllData() {
  const { admin, error } = await requireAdmin()
  if (error || !admin) return { error: error ?? "Unknown error" }

  try {
    // Transactional data first
    await deleteAll(admin, "stock_audit_items")
    await deleteAll(admin, "stock_audits")
    await deleteAll(admin, "payments")
    await deleteAll(admin, "invoices")
    await deleteAll(admin, "inventory_transactions")
    await deleteAll(admin, "purchase_order_items")
    await deleteAll(admin, "purchase_orders")
    // Base data
    await deleteAll(admin, "inventory_items")
    await deleteAll(admin, "storage_locations")
    await deleteAll(admin, "suppliers")
    await deleteAll(admin, "categories")
    await deleteAll(admin, "sites")

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to clear all data" }
  }
}

// ---------------------------------------------------------------------------
// Seed Step 1: Base Data — categories, sites, storage locations, suppliers, items
// ---------------------------------------------------------------------------

export async function seedStep_BaseData() {
  const { admin, error } = await requireAdmin()
  if (error || !admin) return { error: error ?? "Unknown error" }

  try {
    const categories = [
      { id: "c1000000-0000-0000-0000-000000000001", name: "Cement", description: "Portland cement, white cement, and specialty cements" },
      { id: "c1000000-0000-0000-0000-000000000002", name: "Steel/Rebar", description: "TMT bars, structural steel, binding wire" },
      { id: "c1000000-0000-0000-0000-000000000003", name: "Bricks/Blocks", description: "Clay bricks, AAC blocks, concrete blocks" },
      { id: "c1000000-0000-0000-0000-000000000004", name: "Sand/Aggregate", description: "River sand, M-sand, crushed stone aggregate" },
      { id: "c1000000-0000-0000-0000-000000000005", name: "Timber/Plywood", description: "Shuttering plywood, form lumber, scaffolding planks" },
      { id: "c1000000-0000-0000-0000-000000000006", name: "Pipes/Fittings", description: "PVC pipes, CPVC pipes, GI pipes, fittings" },
      { id: "c1000000-0000-0000-0000-000000000007", name: "Electrical", description: "Wires, cables, switches, MCBs, panels" },
      { id: "c1000000-0000-0000-0000-000000000008", name: "Paint/Finish", description: "Interior paint, exterior paint, primer, putty" },
      { id: "c1000000-0000-0000-0000-000000000009", name: "Hardware/Fasteners", description: "Nails, screws, bolts, hinges, locks" },
      { id: "c1000000-0000-0000-0000-000000000010", name: "Safety Equipment", description: "Helmets, gloves, safety shoes, harnesses" },
      { id: "c1000000-0000-0000-0000-000000000011", name: "Tools", description: "Power tools, hand tools, measuring instruments" },
      { id: "c1000000-0000-0000-0000-000000000012", name: "Tiles/Flooring", description: "Vitrified tiles, ceramic tiles, marble, granite" },
    ]

    const sites = [
      { id: "a1000000-0000-0000-0000-000000000001", name: "Blessing Heights - Tower A & B", code: "SITE-001", address: "Plot No. 42, Sector 62, Blessing Heights", city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
      { id: "a1000000-0000-0000-0000-000000000002", name: "Blessing Greens Residency", code: "SITE-002", address: "Plot No. 78, Sector 104, Green Valley", city: "Gurugram", state: "Haryana", pincode: "122001" },
    ]

    const storageLocations = [
      { id: "b1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", name: "Main Store", description: "Primary storage area near site entrance" },
      { id: "b1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", name: "Tower A Ground Floor", description: "Temporary storage at Tower A base" },
      { id: "b1000000-0000-0000-0000-000000000003", site_id: "a1000000-0000-0000-0000-000000000001", name: "Steel Yard", description: "Open yard for steel and rebar storage" },
      { id: "b1000000-0000-0000-0000-000000000004", site_id: "a1000000-0000-0000-0000-000000000002", name: "Central Warehouse", description: "Main covered warehouse" },
      { id: "b1000000-0000-0000-0000-000000000005", site_id: "a1000000-0000-0000-0000-000000000002", name: "Block C Store", description: "Storage room at Block C" },
      { id: "b1000000-0000-0000-0000-000000000006", site_id: "a1000000-0000-0000-0000-000000000002", name: "Open Yard", description: "Open area for aggregate and sand" },
    ]

    const suppliers = [
      { id: "cd100000-0000-0000-0000-000000000001", name: "UltraTech Cement Dealers", code: "SUP-001", contact_person: "Rajesh Sharma", email: "rajesh@ultratechdelhi.com", phone: "9876543210", gst_number: "09ABCDE1234F1Z5", address: "45 Industrial Area, Phase 2", city: "Noida", state: "Uttar Pradesh", pincode: "201305" },
      { id: "cd100000-0000-0000-0000-000000000002", name: "Tata Steel Distributors", code: "SUP-002", contact_person: "Amit Verma", email: "amit@tatasteel-dist.com", phone: "9876543211", gst_number: "07FGHIJ5678K2Y3", address: "12 Steel Market, Sector 18", city: "Gurugram", state: "Haryana", pincode: "122015" },
      { id: "cd100000-0000-0000-0000-000000000003", name: "Delhi Brick Suppliers", code: "SUP-003", contact_person: "Suresh Kumar", email: "suresh@delhibricks.com", phone: "9876543212", gst_number: "07KLMNO9012P3X2", address: "89 Brick Lane, Palam", city: "New Delhi", state: "Delhi", pincode: "110045" },
      { id: "cd100000-0000-0000-0000-000000000004", name: "Shree Electricals", code: "SUP-004", contact_person: "Priya Gupta", email: "priya@shreeelectricals.in", phone: "9876543213", gst_number: "09PQRST3456Q4W1", address: "23 Electrical Market, Bhagirath Palace", city: "New Delhi", state: "Delhi", pincode: "110006" },
      { id: "cd100000-0000-0000-0000-000000000005", name: "Gupta Paint House", code: "SUP-005", contact_person: "Manoj Gupta", email: "manoj@guptapaints.com", phone: "9876543214", gst_number: "07UVWXY7890R5V9", address: "56 Color Street, Kirti Nagar", city: "New Delhi", state: "Delhi", pincode: "110015" },
    ]

    const inventoryItems = [
      { id: "e1000000-0000-0000-0000-000000000001", name: "OPC 43 Grade Cement", code: "MAT-001", category_id: "c1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "bags", current_stock: 999999, minimum_stock: 200, reorder_quantity: 500, unit_price: 380, description: "UltraTech OPC 43 Grade - 50kg bags" },
      { id: "e1000000-0000-0000-0000-000000000002", name: "PPC Cement", code: "MAT-002", category_id: "c1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "bags", current_stock: 999999, minimum_stock: 150, reorder_quantity: 300, unit_price: 360, description: "Portland Pozzolana Cement - 50kg bags" },
      { id: "e1000000-0000-0000-0000-000000000003", name: "TMT Steel Bar 12mm", code: "MAT-003", category_id: "c1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000003", unit: "tonnes", current_stock: 999999, minimum_stock: 5, reorder_quantity: 10, unit_price: 62000, description: "Fe-500D TMT bars, 12mm diameter" },
      { id: "e1000000-0000-0000-0000-000000000004", name: "TMT Steel Bar 16mm", code: "MAT-004", category_id: "c1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000003", unit: "tonnes", current_stock: 999999, minimum_stock: 5, reorder_quantity: 10, unit_price: 61000, description: "Fe-500D TMT bars, 16mm diameter" },
      { id: "e1000000-0000-0000-0000-000000000005", name: "Red Clay Bricks", code: "MAT-005", category_id: "c1000000-0000-0000-0000-000000000003", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000002", unit: "pcs", current_stock: 999999, minimum_stock: 10000, reorder_quantity: 20000, unit_price: 8, description: "Standard size red clay bricks" },
      { id: "e1000000-0000-0000-0000-000000000006", name: "AAC Blocks 600x200x150", code: "MAT-006", category_id: "c1000000-0000-0000-0000-000000000003", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000002", unit: "pcs", current_stock: 999999, minimum_stock: 2000, reorder_quantity: 5000, unit_price: 55, description: "Autoclaved Aerated Concrete blocks" },
      { id: "e1000000-0000-0000-0000-000000000007", name: "River Sand", code: "MAT-007", category_id: "c1000000-0000-0000-0000-000000000004", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "cu.m", current_stock: 999999, minimum_stock: 20, reorder_quantity: 40, unit_price: 2800, description: "Fine river sand for plastering" },
      { id: "e1000000-0000-0000-0000-000000000008", name: "Crushed Stone 20mm", code: "MAT-008", category_id: "c1000000-0000-0000-0000-000000000004", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "cu.m", current_stock: 999999, minimum_stock: 25, reorder_quantity: 50, unit_price: 1800, description: "20mm graded crushed stone aggregate" },
      { id: "e1000000-0000-0000-0000-000000000009", name: "Shuttering Plywood 18mm", code: "MAT-009", category_id: "c1000000-0000-0000-0000-000000000005", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "pcs", current_stock: 999999, minimum_stock: 30, reorder_quantity: 50, unit_price: 1450, description: "Film-faced shuttering plywood sheets" },
      { id: "e1000000-0000-0000-0000-000000000010", name: "PVC Pipe 4 inch", code: "MAT-010", category_id: "c1000000-0000-0000-0000-000000000006", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "metres", current_stock: 999999, minimum_stock: 100, reorder_quantity: 200, unit_price: 185, description: "Astral PVC SWR pipes, 110mm" },
      { id: "e1000000-0000-0000-0000-000000000011", name: "Copper Wire 2.5mm", code: "MAT-011", category_id: "c1000000-0000-0000-0000-000000000007", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "metres", current_stock: 999999, minimum_stock: 500, reorder_quantity: 1000, unit_price: 28, description: "Polycab FR copper wire, 2.5 sq mm" },
      { id: "e1000000-0000-0000-0000-000000000012", name: "Asian Paints Primer", code: "MAT-012", category_id: "c1000000-0000-0000-0000-000000000008", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "litres", current_stock: 999999, minimum_stock: 50, reorder_quantity: 100, unit_price: 140, description: "Asian Paints exterior primer, white" },
      { id: "e1000000-0000-0000-0000-000000000013", name: "Safety Helmets", code: "MAT-013", category_id: "c1000000-0000-0000-0000-000000000010", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "pcs", current_stock: 999999, minimum_stock: 20, reorder_quantity: 30, unit_price: 250, description: "ISI marked safety helmets, yellow" },
      { id: "e1000000-0000-0000-0000-000000000014", name: "Binding Wire", code: "MAT-014", category_id: "c1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000003", unit: "kg", current_stock: 999999, minimum_stock: 100, reorder_quantity: 200, unit_price: 72, description: "18 gauge GI binding wire" },
      { id: "e1000000-0000-0000-0000-000000000015", name: "GI Nails 3 inch", code: "MAT-015", category_id: "c1000000-0000-0000-0000-000000000009", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "kg", current_stock: 999999, minimum_stock: 10, reorder_quantity: 25, unit_price: 95, description: "Galvanized iron wire nails" },
      { id: "e1000000-0000-0000-0000-000000000016", name: "Vitrified Floor Tiles", code: "MAT-016", category_id: "c1000000-0000-0000-0000-000000000012", site_id: "a1000000-0000-0000-0000-000000000001", storage_location_id: "b1000000-0000-0000-0000-000000000001", unit: "sq.m", current_stock: 999999, minimum_stock: 100, reorder_quantity: 200, unit_price: 580, description: "Kajaria vitrified tiles 600x600mm" },
      { id: "e1000000-0000-0000-0000-000000000017", name: "OPC 53 Grade Cement", code: "MAT-017", category_id: "c1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000002", storage_location_id: "b1000000-0000-0000-0000-000000000004", unit: "bags", current_stock: 999999, minimum_stock: 150, reorder_quantity: 400, unit_price: 400, description: "UltraTech OPC 53 Grade - 50kg bags" },
      { id: "e1000000-0000-0000-0000-000000000018", name: "TMT Steel Bar 10mm", code: "MAT-018", category_id: "c1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000002", storage_location_id: "b1000000-0000-0000-0000-000000000006", unit: "tonnes", current_stock: 999999, minimum_stock: 3, reorder_quantity: 8, unit_price: 63000, description: "Fe-500D TMT bars, 10mm diameter" },
      { id: "e1000000-0000-0000-0000-000000000019", name: "M-Sand", code: "MAT-019", category_id: "c1000000-0000-0000-0000-000000000004", site_id: "a1000000-0000-0000-0000-000000000002", storage_location_id: "b1000000-0000-0000-0000-000000000006", unit: "cu.m", current_stock: 999999, minimum_stock: 30, reorder_quantity: 60, unit_price: 2200, description: "Manufactured sand, Zone II graded" },
      { id: "e1000000-0000-0000-0000-000000000020", name: "CPVC Pipe 1 inch", code: "MAT-020", category_id: "c1000000-0000-0000-0000-000000000006", site_id: "a1000000-0000-0000-0000-000000000002", storage_location_id: "b1000000-0000-0000-0000-000000000004", unit: "metres", current_stock: 999999, minimum_stock: 50, reorder_quantity: 150, unit_price: 210, description: "Astral CPVC pipes for hot water" },
    ]

    const { error: e1 } = await admin.from("categories").upsert(categories, { onConflict: "id" })
    if (e1) throw new Error(`Categories: ${e1.message}`)

    const { error: e2 } = await admin.from("sites").upsert(sites, { onConflict: "id" })
    if (e2) throw new Error(`Sites: ${e2.message}`)

    const { error: e3 } = await admin.from("storage_locations").upsert(storageLocations, { onConflict: "id" })
    if (e3) throw new Error(`Storage locations: ${e3.message}`)

    const { error: e4 } = await admin.from("suppliers").upsert(suppliers, { onConflict: "id" })
    if (e4) throw new Error(`Suppliers: ${e4.message}`)

    // Items inserted with buffer stock (999999) to prevent negative-stock trigger errors
    const { error: e5 } = await admin.from("inventory_items").upsert(inventoryItems, { onConflict: "id" })
    if (e5) throw new Error(`Inventory items: ${e5.message}`)

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to seed base data" }
  }
}

// ---------------------------------------------------------------------------
// Seed Step 2: Purchase Orders & PO Items
// ---------------------------------------------------------------------------

export async function seedStep_PurchaseOrders() {
  const { admin, userId, error } = await requireAdmin()
  if (error || !admin || !userId) return { error: error ?? "Unknown error" }

  try {
    const purchaseOrders = [
      { id: "da100000-0000-0000-0000-000000000001", po_number: "PO-001", site_id: "a1000000-0000-0000-0000-000000000001", supplier_id: "cd100000-0000-0000-0000-000000000001", status: "received", order_date: daysAgo(25), expected_delivery_date: daysAgo(20), delivery_address: "Plot No. 42, Sector 62, Blessing Heights, Noida", subtotal: 296610.17, tax_amount: 53389.83, total_amount: 350000.00, notes: "Urgent cement requirement for Tower A slab casting.", created_by: userId, approved_by: userId },
      { id: "da100000-0000-0000-0000-000000000002", po_number: "PO-002", site_id: "a1000000-0000-0000-0000-000000000001", supplier_id: "cd100000-0000-0000-0000-000000000002", status: "partially_received", order_date: daysAgo(20), expected_delivery_date: daysAgo(12), delivery_address: "Plot No. 42, Sector 62, Blessing Heights, Noida - Steel Yard", subtotal: 720339.00, tax_amount: 129661.20, total_amount: 850000.20, notes: "Steel for 5th floor columns and beams.", created_by: userId, approved_by: userId },
      { id: "da100000-0000-0000-0000-000000000003", po_number: "PO-003", site_id: "a1000000-0000-0000-0000-000000000001", supplier_id: "cd100000-0000-0000-0000-000000000003", status: "sent", order_date: daysAgo(15), expected_delivery_date: daysAgo(5), delivery_address: "Plot No. 42, Sector 62, Blessing Heights, Noida - Tower A Ground Floor", subtotal: 332627.12, tax_amount: 59872.88, total_amount: 392500.00, notes: "Bricks and blocks for 4th floor partition walls.", created_by: userId, approved_by: userId },
      { id: "da100000-0000-0000-0000-000000000004", po_number: "PO-004", site_id: "a1000000-0000-0000-0000-000000000002", supplier_id: "cd100000-0000-0000-0000-000000000001", status: "received", order_date: daysAgo(18), expected_delivery_date: daysAgo(13), delivery_address: "Plot No. 78, Sector 104, Green Valley, Gurugram - Central Warehouse", subtotal: 135593.22, tax_amount: 24406.78, total_amount: 160000.00, notes: "Cement for foundation work, Block D.", created_by: userId, approved_by: userId },
      { id: "da100000-0000-0000-0000-000000000005", po_number: "PO-005", site_id: "a1000000-0000-0000-0000-000000000001", supplier_id: "cd100000-0000-0000-0000-000000000004", status: "draft", order_date: daysAgo(3), expected_delivery_date: daysFromNow(7), delivery_address: "Plot No. 42, Sector 62, Blessing Heights, Noida - Main Store", subtotal: 66949.15, tax_amount: 12050.85, total_amount: 79000.00, notes: "Electrical supplies for Tower B wiring phase.", created_by: userId, approved_by: null },
      { id: "da100000-0000-0000-0000-000000000006", po_number: "PO-006", site_id: "a1000000-0000-0000-0000-000000000001", supplier_id: "cd100000-0000-0000-0000-000000000005", status: "sent", order_date: daysAgo(7), expected_delivery_date: daysFromNow(3), delivery_address: "Plot No. 42, Sector 62, Blessing Heights, Noida - Main Store", subtotal: 11864.41, tax_amount: 2135.59, total_amount: 14000.00, notes: "Exterior primer for Tower A facade.", created_by: userId, approved_by: userId },
    ]

    const poItems = [
      { id: "de100000-0000-0000-0000-000000000001", purchase_order_id: "da100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000001", quantity_ordered: 500, quantity_received: 0, unit_price: 380.00, tax_percent: 18.00, total_price: 224200.00 },
      { id: "de100000-0000-0000-0000-000000000002", purchase_order_id: "da100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000002", quantity_ordered: 300, quantity_received: 0, unit_price: 360.00, tax_percent: 18.00, total_price: 127440.00 },
      { id: "de100000-0000-0000-0000-000000000003", purchase_order_id: "da100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000003", quantity_ordered: 5, quantity_received: 0, unit_price: 62000.00, tax_percent: 18.00, total_price: 365800.00 },
      { id: "de100000-0000-0000-0000-000000000004", purchase_order_id: "da100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000004", quantity_ordered: 5, quantity_received: 0, unit_price: 61000.00, tax_percent: 18.00, total_price: 359900.00 },
      { id: "de100000-0000-0000-0000-000000000005", purchase_order_id: "da100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000014", quantity_ordered: 200, quantity_received: 0, unit_price: 72.00, tax_percent: 18.00, total_price: 16992.00 },
      { id: "de100000-0000-0000-0000-000000000006", purchase_order_id: "da100000-0000-0000-0000-000000000003", item_id: "e1000000-0000-0000-0000-000000000005", quantity_ordered: 15000, quantity_received: 0, unit_price: 8.00, tax_percent: 18.00, total_price: 141600.00 },
      { id: "de100000-0000-0000-0000-000000000007", purchase_order_id: "da100000-0000-0000-0000-000000000003", item_id: "e1000000-0000-0000-0000-000000000006", quantity_ordered: 5000, quantity_received: 0, unit_price: 55.00, tax_percent: 18.00, total_price: 324500.00 },
      { id: "de100000-0000-0000-0000-000000000008", purchase_order_id: "da100000-0000-0000-0000-000000000004", item_id: "e1000000-0000-0000-0000-000000000017", quantity_ordered: 400, quantity_received: 0, unit_price: 400.00, tax_percent: 0.00, total_price: 160000.00 },
      { id: "de100000-0000-0000-0000-000000000009", purchase_order_id: "da100000-0000-0000-0000-000000000005", item_id: "e1000000-0000-0000-0000-000000000011", quantity_ordered: 1000, quantity_received: 0, unit_price: 28.00, tax_percent: 18.00, total_price: 33040.00 },
      { id: "de100000-0000-0000-0000-000000000010", purchase_order_id: "da100000-0000-0000-0000-000000000005", item_id: "e1000000-0000-0000-0000-000000000010", quantity_ordered: 300, quantity_received: 0, unit_price: 185.00, tax_percent: 18.00, total_price: 65490.00 },
      { id: "de100000-0000-0000-0000-000000000011", purchase_order_id: "da100000-0000-0000-0000-000000000006", item_id: "e1000000-0000-0000-0000-000000000012", quantity_ordered: 100, quantity_received: 0, unit_price: 140.00, tax_percent: 0.00, total_price: 14000.00 },
    ]

    const { error: e6 } = await admin.from("purchase_orders").upsert(purchaseOrders, { onConflict: "id" })
    if (e6) throw new Error(`Purchase orders: ${e6.message}`)

    const { error: e7 } = await admin.from("purchase_order_items").upsert(poItems, { onConflict: "id" })
    if (e7) throw new Error(`PO items: ${e7.message}`)

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to seed purchase orders" }
  }
}

// ---------------------------------------------------------------------------
// Seed Step 3: Inventory Transactions
// ---------------------------------------------------------------------------

export async function seedStep_Transactions() {
  const { admin, userId, error } = await requireAdmin()
  if (error || !admin || !userId) return { error: error ?? "Unknown error" }

  try {
    const transactions = [
      { id: "cf100000-0000-0000-0000-000000000001", transaction_number: "TXN-001", item_id: "e1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 300, rejected_quantity: 5, unit_price: 380, purchase_order_id: "da100000-0000-0000-0000-000000000001", challan_number: "CH-2026-001", vehicle_number: "UP-32-AB-1234", remarks: "First lot of OPC 43. 5 bags damaged in transit.", performed_by: userId, transaction_date: daysAgo(28) },
      { id: "cf100000-0000-0000-0000-000000000002", transaction_number: "TXN-002", item_id: "e1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 200, rejected_quantity: 0, unit_price: 380, purchase_order_id: "da100000-0000-0000-0000-000000000001", challan_number: "CH-2026-002", vehicle_number: "UP-32-AB-1234", remarks: "Second lot of OPC 43. All bags in good condition.", performed_by: userId, transaction_date: daysAgo(25) },
      { id: "cf100000-0000-0000-0000-000000000003", transaction_number: "TXN-003", item_id: "e1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 300, rejected_quantity: 0, unit_price: 360, purchase_order_id: "da100000-0000-0000-0000-000000000001", challan_number: "CH-2026-003", vehicle_number: "UP-32-CD-5678", remarks: "PPC cement full delivery. Quality verified.", performed_by: userId, transaction_date: daysAgo(25) },
      { id: "cf100000-0000-0000-0000-000000000004", transaction_number: "TXN-004", item_id: "e1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 50, rejected_quantity: 0, unit_price: 380, issued_to: "Tower A - Mason Team (Rajendra)", purpose: "Column casting, 4th floor", remarks: "Issued for column work.", performed_by: userId, transaction_date: daysAgo(24) },
      { id: "cf100000-0000-0000-0000-000000000005", transaction_number: "TXN-005", item_id: "e1000000-0000-0000-0000-000000000003", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 3, rejected_quantity: 0, unit_price: 62000, purchase_order_id: "da100000-0000-0000-0000-000000000002", challan_number: "CH-2026-004", vehicle_number: "HR-26-EF-9012", remarks: "TMT 12mm first lot. Weight verified.", performed_by: userId, transaction_date: daysAgo(22) },
      { id: "cf100000-0000-0000-0000-000000000006", transaction_number: "TXN-006", item_id: "e1000000-0000-0000-0000-000000000004", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 2, rejected_quantity: 0, unit_price: 61000, purchase_order_id: "da100000-0000-0000-0000-000000000002", challan_number: "CH-2026-005", vehicle_number: "HR-26-EF-9012", remarks: "TMT 16mm partial delivery.", performed_by: userId, transaction_date: daysAgo(20) },
      { id: "cf100000-0000-0000-0000-000000000007", transaction_number: "TXN-007", item_id: "e1000000-0000-0000-0000-000000000014", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 150, rejected_quantity: 0, unit_price: 72, purchase_order_id: "da100000-0000-0000-0000-000000000002", challan_number: "CH-2026-006", vehicle_number: "HR-26-EF-9012", remarks: "Binding wire 150 kg received.", performed_by: userId, transaction_date: daysAgo(20) },
      { id: "cf100000-0000-0000-0000-000000000008", transaction_number: "TXN-008", item_id: "e1000000-0000-0000-0000-000000000017", site_id: "a1000000-0000-0000-0000-000000000002", type: "inward", quantity: 400, rejected_quantity: 3, unit_price: 400, purchase_order_id: "da100000-0000-0000-0000-000000000004", challan_number: "CH-2026-007", vehicle_number: "HR-55-GH-3456", remarks: "OPC 53 full lot. 3 bags hardened, rejected.", performed_by: userId, transaction_date: daysAgo(18) },
      { id: "cf100000-0000-0000-0000-000000000009", transaction_number: "TXN-009", item_id: "e1000000-0000-0000-0000-000000000003", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 1.5, rejected_quantity: 0, unit_price: 62000, issued_to: "Tower A - Formwork Team (Sunil)", purpose: "5th floor beam reinforcement", remarks: "TMT 12mm issued.", performed_by: userId, transaction_date: daysAgo(17) },
      { id: "cf100000-0000-0000-0000-000000000010", transaction_number: "TXN-010", item_id: "e1000000-0000-0000-0000-000000000007", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 20, rejected_quantity: 0, unit_price: 2800, challan_number: "CH-2026-008", vehicle_number: "UP-78-JK-7890", remarks: "Spot purchase river sand.", performed_by: userId, transaction_date: daysAgo(16) },
      { id: "cf100000-0000-0000-0000-000000000011", transaction_number: "TXN-011", item_id: "e1000000-0000-0000-0000-000000000008", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 25, rejected_quantity: 0, unit_price: 1800, challan_number: "CH-2026-009", vehicle_number: "UP-78-JK-7890", remarks: "20mm aggregate for RCC work.", performed_by: userId, transaction_date: daysAgo(15) },
      { id: "cf100000-0000-0000-0000-000000000012", transaction_number: "TXN-012", item_id: "e1000000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 100, rejected_quantity: 0, unit_price: 380, issued_to: "Tower A - RCC Team (Vikram)", purpose: "4th floor slab casting", remarks: "Bulk cement issue for slab.", performed_by: userId, transaction_date: daysAgo(14) },
      { id: "cf100000-0000-0000-0000-000000000013", transaction_number: "TXN-013", item_id: "e1000000-0000-0000-0000-000000000007", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 10, rejected_quantity: 0, unit_price: 2800, issued_to: "Tower A - RCC Team (Vikram)", purpose: "4th floor slab casting", remarks: "Sand for concrete mix.", performed_by: userId, transaction_date: daysAgo(14) },
      { id: "cf100000-0000-0000-0000-000000000014", transaction_number: "TXN-014", item_id: "e1000000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 80, rejected_quantity: 0, unit_price: 360, issued_to: "Tower B - Mason Team (Dinesh)", purpose: "3rd floor brick partition walls", remarks: "PPC cement for mortar mix.", performed_by: userId, transaction_date: daysAgo(13) },
      { id: "cf100000-0000-0000-0000-000000000015", transaction_number: "TXN-015", item_id: "e1000000-0000-0000-0000-000000000017", site_id: "a1000000-0000-0000-0000-000000000002", type: "outward", quantity: 100, rejected_quantity: 0, unit_price: 400, issued_to: "Block D - Foundation Team (Hari)", purpose: "Foundation concrete, Block D", remarks: "Cement for footing concrete.", performed_by: userId, transaction_date: daysAgo(12) },
      { id: "cf100000-0000-0000-0000-000000000016", transaction_number: "TXN-016", item_id: "e1000000-0000-0000-0000-000000000009", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 20, rejected_quantity: 0, unit_price: 1450, issued_to: "Tower A - Shuttering Team (Babu)", purpose: "5th floor column shuttering", remarks: "Plywood for column formwork.", performed_by: userId, transaction_date: daysAgo(10) },
      { id: "cf100000-0000-0000-0000-000000000017", transaction_number: "TXN-017", item_id: "e1000000-0000-0000-0000-000000000011", site_id: "a1000000-0000-0000-0000-000000000001", type: "inward", quantity: 500, rejected_quantity: 0, unit_price: 28, challan_number: "CH-2026-010", vehicle_number: "DL-01-MN-4567", remarks: "Emergency purchase copper wire.", performed_by: userId, transaction_date: daysAgo(9) },
      { id: "cf100000-0000-0000-0000-000000000018", transaction_number: "TXN-018", item_id: "e1000000-0000-0000-0000-000000000011", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 300, rejected_quantity: 0, unit_price: 28, issued_to: "Tower A - Electrician Team (Ravi)", purpose: "3rd floor wiring, flats 301-308", remarks: "Wiring for circuits.", performed_by: userId, transaction_date: daysAgo(8) },
      { id: "cf100000-0000-0000-0000-000000000019", transaction_number: "TXN-019", item_id: "e1000000-0000-0000-0000-000000000010", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 50, rejected_quantity: 0, unit_price: 185, issued_to: "Tower A - Plumbing Team (Santosh)", purpose: "Drainage line, 3rd and 4th floor", remarks: "PVC SWR pipes.", performed_by: userId, transaction_date: daysAgo(7) },
      { id: "cf100000-0000-0000-0000-000000000020", transaction_number: "TXN-020", item_id: "e1000000-0000-0000-0000-000000000019", site_id: "a1000000-0000-0000-0000-000000000002", type: "inward", quantity: 30, rejected_quantity: 0, unit_price: 2200, challan_number: "CH-2026-011", vehicle_number: "HR-55-PQ-8901", remarks: "M-Sand for Block D plastering.", performed_by: userId, transaction_date: daysAgo(6) },
      { id: "cf100000-0000-0000-0000-000000000021", transaction_number: "TXN-021", item_id: "e1000000-0000-0000-0000-000000000015", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 8, rejected_quantity: 0, unit_price: 95, issued_to: "Tower A - Carpentry Team (Mohan)", purpose: "Door frame installation, 2nd floor", remarks: "GI nails for door frame fixing.", performed_by: userId, transaction_date: daysAgo(5) },
      { id: "cf100000-0000-0000-0000-000000000022", transaction_number: "TXN-022", item_id: "e1000000-0000-0000-0000-000000000013", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 10, rejected_quantity: 0, unit_price: 250, issued_to: "Site Safety Officer (Rakesh)", purpose: "New worker safety kit issuance", remarks: "Helmets for new labourers.", performed_by: userId, transaction_date: daysAgo(4) },
      { id: "cf100000-0000-0000-0000-000000000023", transaction_number: "TXN-023", item_id: "e1000000-0000-0000-0000-000000000020", site_id: "a1000000-0000-0000-0000-000000000002", type: "inward", quantity: 100, rejected_quantity: 0, unit_price: 210, challan_number: "CH-2026-012", vehicle_number: "HR-55-RS-2345", remarks: "CPVC pipe for hot water lines.", performed_by: userId, transaction_date: daysAgo(3) },
      { id: "cf100000-0000-0000-0000-000000000024", transaction_number: "TXN-024", item_id: "e1000000-0000-0000-0000-000000000018", site_id: "a1000000-0000-0000-0000-000000000002", type: "outward", quantity: 2, rejected_quantity: 0, unit_price: 63000, issued_to: "Block D - Bar Bending Team (Kallu)", purpose: "Slab reinforcement, Block D ground floor", remarks: "TMT 10mm for slab mesh.", performed_by: userId, transaction_date: daysAgo(2) },
      { id: "cf100000-0000-0000-0000-000000000025", transaction_number: "TXN-025", item_id: "e1000000-0000-0000-0000-000000000014", site_id: "a1000000-0000-0000-0000-000000000001", type: "outward", quantity: 30, rejected_quantity: 0, unit_price: 72, issued_to: "Tower A - Bar Bending Team (Pappu)", purpose: "5th floor column tying", remarks: "Binding wire for rebar tying.", performed_by: userId, transaction_date: daysAgo(1) },
    ]

    // Insert transactions one at a time to ensure trigger ordering
    for (const txn of transactions) {
      const { error: txnErr } = await admin.from("inventory_transactions").upsert(txn, { onConflict: "id" })
      if (txnErr) throw new Error(`Transaction ${txn.transaction_number}: ${txnErr.message}`)
    }

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to seed transactions" }
  }
}

// ---------------------------------------------------------------------------
// Seed Step 4: Invoices & Payments
// ---------------------------------------------------------------------------

export async function seedStep_InvoicesPayments() {
  const { admin, userId, error } = await requireAdmin()
  if (error || !admin || !userId) return { error: error ?? "Unknown error" }

  try {
    const invoices = [
      { id: "eb100000-0000-0000-0000-000000000001", invoice_number: "INV-001", purchase_order_id: "da100000-0000-0000-0000-000000000001", supplier_id: "cd100000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000001", invoice_date: daysAgo(24), due_date: daysAgo(10), subtotal: 296610.17, tax_amount: 53389.83, total_amount: 350000.00, amount_paid: 0, status: "pending", notes: "Invoice for OPC 43 and PPC cement (PO-001). Fully settled." },
      { id: "eb100000-0000-0000-0000-000000000002", invoice_number: "INV-002", purchase_order_id: "da100000-0000-0000-0000-000000000002", supplier_id: "cd100000-0000-0000-0000-000000000002", site_id: "a1000000-0000-0000-0000-000000000001", invoice_date: daysAgo(19), due_date: daysFromNow(10), subtotal: 720338.98, tax_amount: 129661.02, total_amount: 850000.00, amount_paid: 0, status: "pending", notes: "TMT bars and binding wire (PO-002). Balance pending." },
      { id: "eb100000-0000-0000-0000-000000000003", invoice_number: "INV-003", purchase_order_id: "da100000-0000-0000-0000-000000000004", supplier_id: "cd100000-0000-0000-0000-000000000001", site_id: "a1000000-0000-0000-0000-000000000002", invoice_date: daysAgo(17), due_date: daysAgo(5), subtotal: 135593.22, tax_amount: 24406.78, total_amount: 160000.00, amount_paid: 0, status: "pending", notes: "OPC 53 for Blessing Greens (PO-004). OVERDUE." },
      { id: "eb100000-0000-0000-0000-000000000004", invoice_number: "INV-004", purchase_order_id: null, supplier_id: "cd100000-0000-0000-0000-000000000003", site_id: "a1000000-0000-0000-0000-000000000001", invoice_date: daysAgo(8), due_date: daysFromNow(15), subtotal: 169491.53, tax_amount: 30508.47, total_amount: 200000.00, amount_paid: 0, status: "pending", notes: "Advance invoice from Delhi Brick Suppliers." },
      { id: "eb100000-0000-0000-0000-000000000005", invoice_number: "INV-005", purchase_order_id: null, supplier_id: "cd100000-0000-0000-0000-000000000004", site_id: "a1000000-0000-0000-0000-000000000001", invoice_date: daysAgo(10), due_date: daysFromNow(5), subtotal: 38135.59, tax_amount: 6864.41, total_amount: 45000.00, amount_paid: 0, status: "pending", notes: "Copper wire and electrical accessories. Paid via UPI." },
    ]

    const payments = [
      { id: "db100000-0000-0000-0000-000000000001", invoice_id: "eb100000-0000-0000-0000-000000000001", payment_number: "PAY-001", amount: 200000, payment_date: daysAgo(20), payment_method: "bank_transfer", reference_number: "NEFT-REF-20260216-001", notes: "First payment to UltraTech (INV-001).", recorded_by: userId },
      { id: "db100000-0000-0000-0000-000000000002", invoice_id: "eb100000-0000-0000-0000-000000000001", payment_number: "PAY-002", amount: 150000, payment_date: daysAgo(15), payment_method: "bank_transfer", reference_number: "NEFT-REF-20260221-002", notes: "Final settlement for INV-001.", recorded_by: userId },
      { id: "db100000-0000-0000-0000-000000000003", invoice_id: "eb100000-0000-0000-0000-000000000002", payment_number: "PAY-003", amount: 400000, payment_date: daysAgo(12), payment_method: "cheque", reference_number: "CHQ-SBI-784521", notes: "Partial payment to Tata Steel (INV-002).", recorded_by: userId },
      { id: "db100000-0000-0000-0000-000000000004", invoice_id: "eb100000-0000-0000-0000-000000000005", payment_number: "PAY-004", amount: 25000, payment_date: daysAgo(8), payment_method: "upi", reference_number: "UPI-REF-326718294501", notes: "First UPI payment to Shree Electricals.", recorded_by: userId },
      { id: "db100000-0000-0000-0000-000000000005", invoice_id: "eb100000-0000-0000-0000-000000000005", payment_number: "PAY-005", amount: 20000, payment_date: daysAgo(5), payment_method: "upi", reference_number: "UPI-REF-326891034782", notes: "Final UPI payment to Shree Electricals.", recorded_by: userId },
    ]

    const { error: e8 } = await admin.from("invoices").upsert(invoices, { onConflict: "id" })
    if (e8) throw new Error(`Invoices: ${e8.message}`)

    // Insert payments one at a time so the invoice-update trigger fires correctly
    for (const pay of payments) {
      const { error: payErr } = await admin.from("payments").upsert(pay, { onConflict: "id" })
      if (payErr) throw new Error(`Payment ${pay.payment_number}: ${payErr.message}`)
    }

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to seed invoices & payments" }
  }
}

// ---------------------------------------------------------------------------
// Seed Step 5: Stock Audits
// ---------------------------------------------------------------------------

export async function seedStep_Audits() {
  const { admin, userId, error } = await requireAdmin()
  if (error || !admin || !userId) return { error: error ?? "Unknown error" }

  try {
    const audits = [
      { id: "a0100000-0000-0000-0000-000000000001", audit_number: "AUD-001", site_id: "a1000000-0000-0000-0000-000000000001", audit_date: daysAgo(10), status: "completed", conducted_by: userId, reviewed_by: userId, notes: "Monthly stock verification for Blessing Heights. Minor variances found." },
      { id: "a0100000-0000-0000-0000-000000000002", audit_number: "AUD-002", site_id: "a1000000-0000-0000-0000-000000000002", audit_date: daysAgo(3), status: "in_progress", conducted_by: userId, reviewed_by: null, notes: "Bi-weekly audit for Blessing Greens. Pending review." },
    ]

    const auditItems = [
      { id: "ae100000-0000-0000-0000-000000000001", audit_id: "a0100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000001", system_quantity: 450, physical_quantity: 445, variance_reason: "Minor wastage during handling. 5 bags torn or partially used." },
      { id: "ae100000-0000-0000-0000-000000000002", audit_id: "a0100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000002", system_quantity: 120, physical_quantity: 120, variance_reason: null },
      { id: "ae100000-0000-0000-0000-000000000003", audit_id: "a0100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000003", system_quantity: 8.5, physical_quantity: 8.4, variance_reason: "Weighbridge measurement 0.1T less. Within tolerance." },
      { id: "ae100000-0000-0000-0000-000000000004", audit_id: "a0100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000005", system_quantity: 25000, physical_quantity: 24850, variance_reason: "Approximately 150 bricks broken during unloading." },
      { id: "ae100000-0000-0000-0000-000000000005", audit_id: "a0100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000007", system_quantity: 35, physical_quantity: 34, variance_reason: "Sand settling and moisture evaporation after rain." },
      { id: "ae100000-0000-0000-0000-000000000006", audit_id: "a0100000-0000-0000-0000-000000000001", item_id: "e1000000-0000-0000-0000-000000000011", system_quantity: 1500, physical_quantity: 1510, variance_reason: "Measurement rounding during previous issuances." },
      { id: "ae100000-0000-0000-0000-000000000007", audit_id: "a0100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000017", system_quantity: 300, physical_quantity: 298, variance_reason: "Two bags with hardened cement due to moisture." },
      { id: "ae100000-0000-0000-0000-000000000008", audit_id: "a0100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000018", system_quantity: 6, physical_quantity: 6, variance_reason: null },
      { id: "ae100000-0000-0000-0000-000000000009", audit_id: "a0100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000019", system_quantity: 50, physical_quantity: 48, variance_reason: "Volume variance after rainfall. Sand compacted." },
      { id: "ae100000-0000-0000-0000-000000000010", audit_id: "a0100000-0000-0000-0000-000000000002", item_id: "e1000000-0000-0000-0000-000000000020", system_quantity: 80, physical_quantity: 80, variance_reason: null },
    ]

    const { error: e9 } = await admin.from("stock_audits").upsert(audits, { onConflict: "id" })
    if (e9) throw new Error(`Audits: ${e9.message}`)

    const { error: e10 } = await admin.from("stock_audit_items").upsert(auditItems, { onConflict: "id" })
    if (e10) throw new Error(`Audit items: ${e10.message}`)

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to seed audits" }
  }
}

// ---------------------------------------------------------------------------
// Seed Step 6: Finalize — fix trigger-modified values to match intended data
// ---------------------------------------------------------------------------

export async function seedStep_Finalize() {
  const { admin, error } = await requireAdmin()
  if (error || !admin) return { error: error ?? "Unknown error" }

  try {
    // Target stock levels (triggers changed them from the 999999 buffer)
    const itemStockFixes: [string, number][] = [
      ["e1000000-0000-0000-0000-000000000001", 450],
      ["e1000000-0000-0000-0000-000000000002", 120],
      ["e1000000-0000-0000-0000-000000000003", 8.5],
      ["e1000000-0000-0000-0000-000000000004", 3.2],
      ["e1000000-0000-0000-0000-000000000005", 25000],
      ["e1000000-0000-0000-0000-000000000006", 3500],
      ["e1000000-0000-0000-0000-000000000007", 35],
      ["e1000000-0000-0000-0000-000000000008", 42],
      ["e1000000-0000-0000-0000-000000000009", 80],
      ["e1000000-0000-0000-0000-000000000010", 200],
      ["e1000000-0000-0000-0000-000000000011", 1500],
      ["e1000000-0000-0000-0000-000000000012", 100],
      ["e1000000-0000-0000-0000-000000000013", 45],
      ["e1000000-0000-0000-0000-000000000014", 150],
      ["e1000000-0000-0000-0000-000000000015", 25],
      ["e1000000-0000-0000-0000-000000000016", 0],
      ["e1000000-0000-0000-0000-000000000017", 300],
      ["e1000000-0000-0000-0000-000000000018", 6],
      ["e1000000-0000-0000-0000-000000000019", 50],
      ["e1000000-0000-0000-0000-000000000020", 80],
    ]

    for (const [id, current_stock] of itemStockFixes) {
      await admin.from("inventory_items").update({ current_stock }).eq("id", id)
    }

    // Target PO item quantity_received (triggers added to them from 0)
    const poItemFixes: [string, number][] = [
      ["de100000-0000-0000-0000-000000000001", 500],
      ["de100000-0000-0000-0000-000000000002", 300],
      ["de100000-0000-0000-0000-000000000003", 3],
      ["de100000-0000-0000-0000-000000000004", 2],
      ["de100000-0000-0000-0000-000000000005", 150],
      ["de100000-0000-0000-0000-000000000006", 0],
      ["de100000-0000-0000-0000-000000000007", 0],
      ["de100000-0000-0000-0000-000000000008", 400],
      ["de100000-0000-0000-0000-000000000009", 0],
      ["de100000-0000-0000-0000-000000000010", 0],
      ["de100000-0000-0000-0000-000000000011", 0],
    ]

    for (const [id, quantity_received] of poItemFixes) {
      await admin.from("purchase_order_items").update({ quantity_received }).eq("id", id)
    }

    // Target PO statuses (receipt trigger may have changed them)
    const poStatusFixes: [string, string][] = [
      ["da100000-0000-0000-0000-000000000001", "received"],
      ["da100000-0000-0000-0000-000000000002", "partially_received"],
      ["da100000-0000-0000-0000-000000000003", "sent"],
      ["da100000-0000-0000-0000-000000000004", "received"],
      ["da100000-0000-0000-0000-000000000005", "draft"],
      ["da100000-0000-0000-0000-000000000006", "sent"],
    ]

    for (const [id, status] of poStatusFixes) {
      await admin.from("purchase_orders").update({ status }).eq("id", id)
    }

    return { error: null }
  } catch (e: any) {
    return { error: e.message ?? "Failed to finalize seed data" }
  }
}
