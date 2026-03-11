import { type SupabaseClient } from "@supabase/supabase-js"

export async function getInvoices(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, suppliers(name), purchase_orders(po_number)")
    .order("created_at", { ascending: false })

  if (error) throw error

  const today = new Date()
  return (data || []).map((inv) => ({
    ...inv,
    computed_status:
      inv.status === "paid" || inv.status === "cancelled"
        ? inv.status
        : new Date(inv.due_date) < today && inv.amount_paid < inv.total_amount
          ? "overdue"
          : inv.status,
  }))
}

export async function getInvoiceById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, suppliers(name, phone, email), purchase_orders(po_number), payments(*, profiles(full_name))")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
