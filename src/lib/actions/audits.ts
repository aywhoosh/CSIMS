"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import type { AuditFormValues } from "@/lib/validations/audit"

export async function createAudit(values: AuditFormValues) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const dateStr = format(new Date(), "yyyyMMdd")
  const { count } = await supabase
    .from("stock_audits")
    .select("*", { count: "exact", head: true })
    .like("audit_number", `AUD-${dateStr}%`)

  const auditNumber = `AUD-${dateStr}-${String((count || 0) + 1).padStart(3, "0")}`

  const { data: audit, error: auditError } = await supabase
    .from("stock_audits")
    .insert({
      audit_number: auditNumber,
      site_id: values.site_id,
      audit_date: values.audit_date,
      notes: values.notes || null,
      conducted_by: user.id,
      status: "completed",
    })
    .select("id")
    .single()

  if (auditError) return { error: auditError.message }

  const auditItems = values.items.map((item) => ({
    audit_id: audit.id,
    item_id: item.item_id,
    system_quantity: item.system_quantity,
    physical_quantity: item.physical_quantity,
    variance_reason: item.variance_reason || null,
  }))

  const { error: itemsError } = await supabase
    .from("stock_audit_items")
    .insert(auditItems)

  if (itemsError) return { error: itemsError.message }

  revalidatePath("/audits")
  return { success: true, id: audit.id }
}

export async function updateAuditStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("stock_audits")
    .update({
      status,
      reviewed_by: status === "reviewed" ? user.id : null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/audits")
  revalidatePath(`/audits/${id}`)
  return { success: true }
}
