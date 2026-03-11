import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInventoryItems } from "@/lib/queries/inventory"
import { getPurchaseOrders } from "@/lib/queries/purchase-orders"
import { PageHeader } from "@/components/shared/page-header"
import { InwardForm } from "@/components/transactions/inward-form"

export default async function NewInwardPage() {
  const supabase = await createServerSupabaseClient()
  const [items, purchaseOrders] = await Promise.all([
    getInventoryItems(supabase),
    getPurchaseOrders(supabase),
  ])

  const itemOptions = items.map((item: any) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    unit: item.unit,
  }))

  const poOptions = purchaseOrders
    .filter((po: any) => po.status !== "received" && po.status !== "cancelled")
    .map((po: any) => ({
      id: po.id,
      po_number: po.po_number,
    }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Inward"
        description="Record material received at site"
      />
      <InwardForm items={itemOptions} purchaseOrders={poOptions} />
    </div>
  )
}
