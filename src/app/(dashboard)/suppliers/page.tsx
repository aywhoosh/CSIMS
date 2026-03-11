import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSuppliers } from "@/lib/queries/suppliers"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { columns } from "@/components/suppliers/supplier-columns"
import { Plus } from "lucide-react"

export default async function SuppliersPage() {
  const supabase = await createServerSupabaseClient()
  const suppliers = await getSuppliers(supabase)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage vendor information"
        action={{ label: "Add Supplier", href: "/suppliers/new", icon: Plus }}
      />
      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="name"
        searchPlaceholder="Search suppliers..."
      />
    </div>
  )
}
