"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { recordPayment } from "@/lib/actions/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { PaymentForm } from "@/components/invoices/payment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { CreditCard } from "lucide-react"
import type { Invoice } from "@/lib/types"
import type { PaymentFormValues } from "@/lib/validations/payment"

interface InvoiceDetailProps {
  invoice: any
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  const remaining = invoice.total_amount - invoice.amount_paid
  const isOverdue =
    new Date(invoice.due_date) < new Date() &&
    invoice.status !== "paid" &&
    invoice.status !== "cancelled"

  async function handlePayment(values: any) {
    const result = await recordPayment(invoice.id, values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Payment recorded")
    setDialogOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Invoice Number</span>
              <span className="font-mono font-semibold">{invoice.invoice_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={isOverdue ? "overdue" : invoice.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Invoice Date</span>
              <span>{formatDate(invoice.invoice_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                {formatDate(invoice.due_date)}
              </span>
            </div>
            {invoice.purchase_orders && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Purchase Order</span>
                <span className="font-mono text-sm">{invoice.purchase_orders.po_number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tax</span>
              <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-bold">{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paid</span>
              <span className="text-green-600">{formatCurrency(invoice.amount_paid)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Remaining</span>
              <span className={`text-lg font-bold ${remaining > 0 ? "text-destructive" : ""}`}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{invoice.suppliers?.name}</span>
            </div>
            {invoice.suppliers?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span>{invoice.suppliers.phone}</span>
              </div>
            )}
            {invoice.suppliers?.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span>{invoice.suppliers.email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          {remaining > 0 && invoice.status !== "cancelled" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <PaymentForm
                  remainingBalance={remaining}
                  onSubmit={handlePayment}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {(invoice.payments || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoice.payments || []).map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.payment_number}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method.replace("_", " ")}
                    </TableCell>
                    <TableCell>{payment.reference_number || "-"}</TableCell>
                    <TableCell>{payment.profiles?.full_name || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
