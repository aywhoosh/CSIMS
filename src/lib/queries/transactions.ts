import { type SupabaseClient } from "@supabase/supabase-js"

export async function getTransactions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("inventory_transactions")
    .select("*, inventory_items(name, code, unit), profiles(full_name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getRecentTransactions(supabase: SupabaseClient, limit = 10) {
  const { data, error } = await supabase
    .from("inventory_transactions")
    .select("*, inventory_items(name, code, unit), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
