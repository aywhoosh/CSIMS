import { type SupabaseClient } from "@supabase/supabase-js"

export async function getSuppliers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("is_active", true)
    .order("name")

  if (error) throw error
  return data || []
}

export async function getSupplierById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
