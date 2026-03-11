"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import type { PaymentFormValues } from "@/lib/validations/payment"

export async function recordPayment(invoiceId: string, values: PaymentFormValues) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("total_amount, amount_paid")
    .eq("id", invoiceId)
    .single()

  if (!invoice) return { error: "Invoice not found" }

  const remaining = invoice.total_amount - invoice.amount_paid
  if (values.amount > remaining) {
    return { error: `Amount exceeds remaining balance of ${remaining}` }
  }

  const dateStr = format(new Date(), "yyyyMMdd")
  const { count } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .like("payment_number", `PAY-${dateStr}%`)

  const paymentNumber = `PAY-${dateStr}-${String((count || 0) + 1).padStart(3, "0")}`

  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    payment_number: paymentNumber,
    amount: values.amount,
    payment_date: values.payment_date,
    payment_method: values.payment_method,
    reference_number: values.reference_number || null,
    notes: values.notes || null,
    recorded_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${invoiceId}`)
  return { success: true }
}
