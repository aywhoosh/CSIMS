import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSuppliers } from "@/lib/queries/suppliers"
import { getSites, getInventoryItems } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { POForm } from "@/components/purchase-orders/po-form"

export default async function NewPurchaseOrderPage() {
  const supabase = await createServerSupabaseClient()
  const [suppliers, sites, items] = await Promise.all([
    getSuppliers(supabase),
    getSites(supabase),
    getInventoryItems(supabase),
  ])

  const supplierOptions = suppliers.map((s: any) => ({ id: s.id, name: s.name }))
  const siteOptions = sites.map((s: any) => ({ id: s.id, name: s.name }))
  const itemOptions = items.map((i: any) => ({
    id: i.id,
    name: i.name,
    code: i.code,
    unit: i.unit,
    unit_price: i.unit_price,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Create Purchase Order" description="Create a new purchase order" />
      <POForm suppliers={supplierOptions} sites={siteOptions} items={itemOptions} />
    </div>
  )
}
