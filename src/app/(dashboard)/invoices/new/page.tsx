import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSuppliers } from "@/lib/queries/suppliers"
import { getSites } from "@/lib/queries/inventory"
import { getPurchaseOrders } from "@/lib/queries/purchase-orders"
import { PageHeader } from "@/components/shared/page-header"
import { InvoiceForm } from "@/components/invoices/invoice-form"

export default async function NewInvoicePage() {
  const supabase = await createServerSupabaseClient()
  const [suppliers, sites, purchaseOrders] = await Promise.all([
    getSuppliers(supabase),
    getSites(supabase),
    getPurchaseOrders(supabase),
  ])

  const supplierOptions = suppliers.map((s: any) => ({ id: s.id, name: s.name }))
  const siteOptions = sites.map((s: any) => ({ id: s.id, name: s.name }))
  const poOptions = purchaseOrders.map((po: any) => ({
    id: po.id,
    po_number: po.po_number,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="New Invoice" description="Record a supplier invoice" />
      <InvoiceForm
        suppliers={supplierOptions}
        sites={siteOptions}
        purchaseOrders={poOptions}
      />
    </div>
  )
}
