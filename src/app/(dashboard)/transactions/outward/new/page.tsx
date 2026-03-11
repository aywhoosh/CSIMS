import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInventoryItems } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { OutwardForm } from "@/components/transactions/outward-form"

export default async function NewOutwardPage() {
  const supabase = await createServerSupabaseClient()
  const items = await getInventoryItems(supabase)

  const itemOptions = items.map((item: any) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    unit: item.unit,
    current_stock: item.current_stock,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Outward"
        description="Record material issued from site"
      />
      <OutwardForm items={itemOptions} />
    </div>
  )
}
