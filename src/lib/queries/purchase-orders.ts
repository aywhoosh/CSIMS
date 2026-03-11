import { type SupabaseClient } from "@supabase/supabase-js"

export async function getPurchaseOrders(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name), sites(name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPurchaseOrderById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name, phone, email), sites(name), purchase_order_items(*, inventory_items(name, code, unit))")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
