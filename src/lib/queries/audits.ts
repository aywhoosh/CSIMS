import { type SupabaseClient } from "@supabase/supabase-js"

export async function getAudits(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("stock_audits")
    .select("*, sites(name), conducted_by:profiles!conducted_by(full_name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAuditById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("stock_audits")
    .select("*, sites(name), conducted_by:profiles!conducted_by(full_name), reviewed_by:profiles!reviewed_by(full_name), stock_audit_items(*, inventory_items(name, code, unit))")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
