import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getPurchaseOrders } from "@/lib/queries/purchase-orders"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { columns } from "@/components/purchase-orders/po-columns"
import { Plus } from "lucide-react"

export default async function PurchaseOrdersPage() {
  const supabase = await createServerSupabaseClient()
  const orders = await getPurchaseOrders(supabase)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders and track deliveries"
        action={{ label: "Create PO", href: "/purchase-orders/new", icon: Plus }}
      />
      <DataTable
        columns={columns}
        data={orders}
        searchKey="po_number"
        searchPlaceholder="Search POs..."
      />
    </div>
  )
}
