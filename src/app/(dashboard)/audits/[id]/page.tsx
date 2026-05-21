import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getAuditById } from "@/lib/queries/audits"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AuditDetail } from "@/components/audits/audit-detail"
import { AuditExportButton } from "@/components/pdf/audit-export-button"

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  let audit
  try {
    audit = await getAuditById(supabase, id)
  } catch {
    notFound()
  }

  if (!audit) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/audits">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Audit {audit.audit_number}</h1>
            <p className="text-sm text-muted-foreground">
              {(audit.sites as any)?.name}
            </p>
          </div>
        </div>
        <AuditExportButton audit={audit as any} auditNumber={audit.audit_number} />
      </div>
      <AuditDetail audit={audit} />
    </div>
  )
}
