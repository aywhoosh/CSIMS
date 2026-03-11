import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getAudits } from "@/lib/queries/audits"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { columns } from "@/components/audits/audit-columns"
import { Plus } from "lucide-react"

export default async function AuditsPage() {
  const supabase = await createServerSupabaseClient()
  const audits = await getAudits(supabase)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Audits"
        description="Conduct and review physical stock audits"
        action={{ label: "New Audit", href: "/audits/new", icon: Plus }}
      />
      <DataTable
        columns={columns}
        data={audits}
        searchKey="audit_number"
        searchPlaceholder="Search audits..."
      />
    </div>
  )
}
