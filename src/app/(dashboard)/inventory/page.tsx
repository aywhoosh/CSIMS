import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInventoryItems } from "@/lib/queries/inventory"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { columns } from "@/components/inventory/inventory-columns"
import { Plus } from "lucide-react"

export default async function InventoryPage() {
  const supabase = await createServerSupabaseClient()
  const items = await getInventoryItems(supabase)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage materials and stock levels"
        action={{ label: "Add Material", href: "/inventory/new", icon: Plus }}
      />
      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Search materials..."
      />
    </div>
  )
}
