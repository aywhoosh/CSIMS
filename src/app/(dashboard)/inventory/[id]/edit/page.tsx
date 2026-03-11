import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInventoryItemById, getCategories, getSites, getStorageLocations } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { InventoryForm } from "@/components/inventory/inventory-form"

export default async function EditInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  let item
  try {
    item = await getInventoryItemById(supabase, id)
  } catch {
    notFound()
  }

  if (!item) notFound()

  const [categories, sites, storageLocations] = await Promise.all([
    getCategories(supabase),
    getSites(supabase),
    getStorageLocations(supabase),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Material" description={`Editing ${item.name}`} />
      <InventoryForm
        categories={categories}
        sites={sites}
        storageLocations={storageLocations}
        initialData={item}
        isEditing
      />
    </div>
  )
}
