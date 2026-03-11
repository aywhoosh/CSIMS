"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import type { PurchaseOrderFormValues } from "@/lib/validations/purchase-order"

export async function createPurchaseOrder(values: PurchaseOrderFormValues) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const monthStr = format(new Date(), "yyyyMM")
  const { count } = await supabase
    .from("purchase_orders")
    .select("*", { count: "exact", head: true })
    .like("po_number", `PO-${monthStr}%`)

  const poNumber = `PO-${monthStr}-${String((count || 0) + 1).padStart(3, "0")}`

  const subtotal = values.items.reduce(
    (sum, item) => sum + item.quantity_ordered * item.unit_price,
    0
  )
  const taxAmount = values.items.reduce(
    (sum, item) =>
      sum + item.quantity_ordered * item.unit_price * (item.tax_percent / 100),
    0
  )

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: poNumber,
      supplier_id: values.supplier_id,
      site_id: values.site_id,
      order_date: values.order_date,
      expected_delivery_date: values.expected_delivery_date || null,
      delivery_address: values.delivery_address || null,
      notes: values.notes || null,
      subtotal,
      tax_amount: taxAmount,
      total_amount: subtotal + taxAmount,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (poError) return { error: poError.message }

  const lineItems = values.items.map((item) => ({
    purchase_order_id: po.id,
    item_id: item.item_id,
    quantity_ordered: item.quantity_ordered,
    unit_price: item.unit_price,
    tax_percent: item.tax_percent,
    total_price: item.quantity_ordered * item.unit_price * (1 + item.tax_percent / 100),
  }))

  const { error: itemsError } = await supabase
    .from("purchase_order_items")
    .insert(lineItems)

  if (itemsError) return { error: itemsError.message }

  revalidatePath("/purchase-orders")
  return { success: true, id: po.id }
}

export async function updatePOStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()

  if (status === "cancelled") {
    const { data: items } = await supabase
      .from("purchase_order_items")
      .select("quantity_received")
      .eq("purchase_order_id", id)
      .gt("quantity_received", 0)

    if (items && items.length > 0) {
      return { error: "Cannot cancel PO with received items" }
    }
  }

  const { error } = await supabase
    .from("purchase_orders")
    .update({ status })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/purchase-orders")
  revalidatePath(`/purchase-orders/${id}`)
  return { success: true }
}
