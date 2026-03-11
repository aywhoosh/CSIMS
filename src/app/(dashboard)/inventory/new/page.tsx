import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCategories, getSites, getStorageLocations } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { InventoryForm } from "@/components/inventory/inventory-form"

export default async function NewInventoryPage() {
  const supabase = await createServerSupabaseClient()
  const [categories, sites, storageLocations] = await Promise.all([
    getCategories(supabase),
    getSites(supabase),
    getStorageLocations(supabase),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="Add Material" description="Add a new material to the inventory" />
      <InventoryForm
        categories={categories}
        sites={sites}
        storageLocations={storageLocations}
      />
    </div>
  )
}
