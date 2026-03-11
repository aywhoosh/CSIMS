import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSites, getInventoryItems } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { AuditForm } from "@/components/audits/audit-form"

export default async function NewAuditPage() {
  const supabase = await createServerSupabaseClient()
  const [sites, items] = await Promise.all([
    getSites(supabase),
    getInventoryItems(supabase),
  ])

  const siteOptions = sites.map((s: any) => ({ id: s.id, name: s.name }))
  const itemOptions = items.map((i: any) => ({
    id: i.id,
    name: i.name,
    code: i.code,
    unit: i.unit,
    current_stock: i.current_stock,
    site_id: i.site_id,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="New Stock Audit" description="Conduct a physical stock audit" />
      <AuditForm sites={siteOptions} items={itemOptions} />
    </div>
  )
}
