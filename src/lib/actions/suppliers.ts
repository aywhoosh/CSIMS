"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { SupplierFormValues } from "@/lib/validations/supplier"

export async function createSupplier(values: SupplierFormValues) {
  const supabase = await createServerSupabaseClient()

  const { data: lastSupplier } = await supabase
    .from("suppliers")
    .select("code")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const nextNum = lastSupplier ? parseInt(lastSupplier.code.split("-")[1]) + 1 : 1
  const code = `SUP-${String(nextNum).padStart(3, "0")}`

  const { error } = await supabase.from("suppliers").insert({
    ...values,
    code,
    email: values.email || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/suppliers")
  return { success: true }
}

export async function updateSupplier(id: string, values: SupplierFormValues) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from("suppliers")
    .update({
      ...values,
      email: values.email || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/suppliers")
  revalidatePath(`/suppliers/${id}`)
  return { success: true }
}
