"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { InventoryItemFormValues } from "@/lib/validations/inventory"

export async function createInventoryItem(values: InventoryItemFormValues) {
  const supabase = await createServerSupabaseClient()

  const { data: lastItem } = await supabase
    .from("inventory_items")
    .select("code")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const nextNum = lastItem ? parseInt(lastItem.code.split("-")[1]) + 1 : 1
  const code = `MAT-${String(nextNum).padStart(3, "0")}`

  const { error } = await supabase.from("inventory_items").insert({
    ...values,
    code,
    storage_location_id: values.storage_location_id || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/inventory")
  return { success: true }
}

export async function updateInventoryItem(id: string, values: InventoryItemFormValues) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from("inventory_items")
    .update({
      ...values,
      storage_location_id: values.storage_location_id || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/inventory")
  revalidatePath(`/inventory/${id}`)
  return { success: true }
}
