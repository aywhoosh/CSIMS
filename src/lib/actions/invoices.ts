"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { InvoiceFormValues } from "@/lib/validations/invoice"

export async function createInvoice(values: InvoiceFormValues) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from("invoices").insert({
    ...values,
    purchase_order_id: values.purchase_order_id || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/invoices")
  return { success: true }
}
