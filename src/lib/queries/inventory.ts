import { type SupabaseClient } from "@supabase/supabase-js"

export async function getInventoryItems(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*, categories(name), sites(name), storage_locations(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getInventoryItemById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*, categories(name), sites(name), storage_locations(name)")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function getLowStockItems(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*, categories(name), sites(name)")
    .eq("is_active", true)
    .order("current_stock", { ascending: true })

  if (error) throw error
  return (data || []).filter(item => item.current_stock <= item.minimum_stock)
}

export async function getCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) throw error
  return data || []
}

export async function getSites(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  if (error) throw error
  return data || []
}

export async function getStorageLocations(supabase: SupabaseClient, siteId?: string) {
  let query = supabase
    .from("storage_locations")
    .select("*")
    .eq("is_active", true)
    .order("name")

  if (siteId) {
    query = query.eq("site_id", siteId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}
