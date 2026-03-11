"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateAuditStatus } from "@/lib/actions/audits"
import { formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"
import type { StockAudit } from "@/lib/types"

interface AuditDetailProps {
  audit: StockAudit
}

export function AuditDetail({ audit }: AuditDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: string) {
    setLoading(true)
    const result = await updateAuditStatus(audit.id, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Audit marked as ${status}`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Audit Number</span>
              <span className="font-mono font-semibold">{audit.audit_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={audit.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Site</span>
              <span>{(audit.sites as any)?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Audit Date</span>
              <span>{formatDate(audit.audit_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conducted By</span>
              <span>{(audit as any).conducted_by?.full_name || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {audit.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{audit.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">System Qty</TableHead>
                <TableHead className="text-right">Physical Qty</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(audit.stock_audit_items || []).map((item: any) => {
                const variance = item.physical_quantity - item.system_quantity
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.inventory_items?.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {item.inventory_items?.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.system_quantity} {item.inventory_items?.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.physical_quantity} {item.inventory_items?.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${
                          variance < 0
                            ? "text-destructive"
                            : variance > 0
                              ? "text-green-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {variance > 0 ? "+" : ""}{variance}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.variance_reason || "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {audit.status === "completed" && (
        <ConfirmDialog
          trigger={
            <Button disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Reviewed
            </Button>
          }
          title="Mark Audit as Reviewed?"
          description="This confirms that the audit results have been reviewed and accepted."
          onConfirm={() => handleStatusChange("reviewed")}
        />
      )}
    </div>
  )
}
