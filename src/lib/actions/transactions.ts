"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"

export async function createInwardTransaction(values: {
  item_id: string
  quantity: number
  rejected_quantity?: number
  unit_price?: number
  purchase_order_id?: string
  challan_number?: string
  vehicle_number?: string
  remarks?: string
  transaction_date: string
}) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: item } = await supabase
    .from("inventory_items")
    .select("site_id")
    .eq("id", values.item_id)
    .single()

  if (!item) return { error: "Item not found" }

  const dateStr = format(new Date(), "yyyyMMdd")
  const { count } = await supabase
    .from("inventory_transactions")
    .select("*", { count: "exact", head: true })
    .like("transaction_number", `TXN-${dateStr}%`)

  const txnNumber = `TXN-${dateStr}-${String((count || 0) + 1).padStart(3, "0")}`

  const { error } = await supabase.from("inventory_transactions").insert({
    transaction_number: txnNumber,
    item_id: values.item_id,
    site_id: item.site_id,
    type: "inward",
    quantity: values.quantity,
    rejected_quantity: values.rejected_quantity || 0,
    unit_price: values.unit_price || null,
    purchase_order_id: values.purchase_order_id || null,
    challan_number: values.challan_number || null,
    vehicle_number: values.vehicle_number || null,
    remarks: values.remarks || null,
    performed_by: user.id,
    transaction_date: values.transaction_date,
  })

  if (error) return { error: error.message }

  revalidatePath("/inventory")
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createOutwardTransaction(values: {
  item_id: string
  quantity: number
  issued_to: string
  purpose: string
  remarks?: string
  transaction_date: string
}) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: item } = await supabase
    .from("inventory_items")
    .select("site_id, current_stock")
    .eq("id", values.item_id)
    .single()

  if (!item) return { error: "Item not found" }
  if (item.current_stock < values.quantity) {
    return { error: `Insufficient stock. Available: ${item.current_stock}` }
  }

  const dateStr = format(new Date(), "yyyyMMdd")
  const { count } = await supabase
    .from("inventory_transactions")
    .select("*", { count: "exact", head: true })
    .like("transaction_number", `TXN-${dateStr}%`)

  const txnNumber = `TXN-${dateStr}-${String((count || 0) + 1).padStart(3, "0")}`

  const { error } = await supabase.from("inventory_transactions").insert({
    transaction_number: txnNumber,
    item_id: values.item_id,
    site_id: item.site_id,
    type: "outward",
    quantity: values.quantity,
    rejected_quantity: 0,
    issued_to: values.issued_to,
    purpose: values.purpose,
    remarks: values.remarks || null,
    performed_by: user.id,
    transaction_date: values.transaction_date,
  })

  if (error) return { error: error.message }

  revalidatePath("/inventory")
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}
