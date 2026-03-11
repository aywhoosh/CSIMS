export type UserRole = "admin" | "site_manager" | "store_keeper"
export type TransactionType = "inward" | "outward"
export type POStatus = "draft" | "sent" | "partially_received" | "received" | "cancelled"
export type InvoiceStatus = "pending" | "partially_paid" | "paid" | "overdue" | "cancelled"
export type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "upi" | "other"
export type AuditStatus = "in_progress" | "completed" | "reviewed"

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  site_id: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StorageLocation {
  id: string
  site_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  sites?: Site
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  code: string
  contact_person: string | null
  email: string | null
  phone: string
  alternate_phone: string | null
  gst_number: string | null
  pan_number: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  name: string
  code: string
  category_id: string
  site_id: string
  storage_location_id: string | null
  unit: string
  current_stock: number
  minimum_stock: number
  reorder_quantity: number
  unit_price: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: Category
  sites?: Site
  storage_locations?: StorageLocation
}

export interface InventoryTransaction {
  id: string
  transaction_number: string
  item_id: string
  site_id: string
  type: TransactionType
  quantity: number
  rejected_quantity: number
  unit_price: number | null
  purchase_order_id: string | null
  issued_to: string | null
  purpose: string | null
  challan_number: string | null
  vehicle_number: string | null
  remarks: string | null
  performed_by: string
  transaction_date: string
  created_at: string
  inventory_items?: InventoryItem
  profiles?: Profile
  purchase_orders?: PurchaseOrder
}

export interface PurchaseOrder {
  id: string
  po_number: string
  site_id: string
  supplier_id: string
  status: POStatus
  order_date: string
  expected_delivery_date: string | null
  delivery_address: string | null
  subtotal: number
  tax_amount: number
  total_amount: number
  notes: string | null
  created_by: string
  approved_by: string | null
  created_at: string
  updated_at: string
  suppliers?: Supplier
  sites?: Site
  profiles?: Profile
  purchase_order_items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  item_id: string
  quantity_ordered: number
  quantity_received: number
  unit_price: number
  tax_percent: number
  total_price: number
  created_at: string
  inventory_items?: InventoryItem
}

export interface Invoice {
  id: string
  invoice_number: string
  purchase_order_id: string | null
  supplier_id: string
  site_id: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  status: InvoiceStatus
  notes: string | null
  created_at: string
  updated_at: string
  suppliers?: Supplier
  purchase_orders?: PurchaseOrder
  sites?: Site
  payments?: Payment[]
}

export interface Payment {
  id: string
  invoice_id: string
  payment_number: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  notes: string | null
  recorded_by: string
  created_at: string
  profiles?: Profile
}

export interface StockAudit {
  id: string
  audit_number: string
  site_id: string
  audit_date: string
  status: AuditStatus
  conducted_by: string
  reviewed_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  sites?: Site
  conducted_by_profile?: Profile
  reviewed_by_profile?: Profile
  stock_audit_items?: StockAuditItem[]
}

export interface StockAuditItem {
  id: string
  audit_id: string
  item_id: string
  system_quantity: number
  physical_quantity: number
  variance: number
  variance_reason: string | null
  created_at: string
  inventory_items?: InventoryItem
}
