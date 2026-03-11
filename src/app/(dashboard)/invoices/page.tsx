import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInvoices } from "@/lib/queries/invoices"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { columns } from "@/components/invoices/invoice-columns"
import { Plus } from "lucide-react"

export default async function InvoicesPage() {
  const supabase = await createServerSupabaseClient()
  const invoices = await getInvoices(supabase)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Track supplier invoices and payments"
        action={{ label: "Add Invoice", href: "/invoices/new", icon: Plus }}
      />
      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoice_number"
        searchPlaceholder="Search invoices..."
      />
    </div>
  )
}
