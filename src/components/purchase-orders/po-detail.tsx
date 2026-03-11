"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePOStatus } from "@/lib/actions/purchase-orders"
import { formatCurrency, formatDate } from "@/lib/utils"
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
import { Send, XCircle } from "lucide-react"
import type { PurchaseOrder } from "@/lib/types"

interface PODetailProps {
  po: PurchaseOrder
}

export function PODetail({ po }: PODetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: string) {
    setLoading(true)
    const result = await updatePOStatus(po.id, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`PO status updated to ${status}`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">PO Number</span>
              <span className="font-mono font-semibold">{po.po_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={po.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order Date</span>
              <span>{formatDate(po.order_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expected Delivery</span>
              <span>{po.expected_delivery_date ? formatDate(po.expected_delivery_date) : "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier & Site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Supplier</span>
              <span className="font-medium">{(po.suppliers as any)?.name}</span>
            </div>
            {(po.suppliers as any)?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span>{(po.suppliers as any).phone}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Site</span>
              <span>{(po.sites as any)?.name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(po.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tax</span>
              <span>{formatCurrency(po.tax_amount)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">{formatCurrency(po.total_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {po.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{po.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(po.purchase_order_items || []).map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.inventory_items?.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {item.inventory_items?.code}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity_ordered} {item.inventory_items?.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity_received} {item.inventory_items?.unit}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{item.tax_percent}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total_price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {po.status === "draft" && (
        <div className="flex gap-3">
          <ConfirmDialog
            trigger={
              <Button disabled={loading}>
                <Send className="mr-2 h-4 w-4" />
                Send to Supplier
              </Button>
            }
            title="Send Purchase Order?"
            description="This will change the PO status to 'Sent'. The supplier will be expected to deliver the items."
            onConfirm={() => handleStatusChange("sent")}
          />
          <ConfirmDialog
            trigger={
              <Button variant="destructive" disabled={loading}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel PO
              </Button>
            }
            title="Cancel Purchase Order?"
            description="This will cancel the purchase order. This action cannot be undone."
            confirmLabel="Cancel PO"
            destructive
            onConfirm={() => handleStatusChange("cancelled")}
          />
        </div>
      )}
    </div>
  )
}
