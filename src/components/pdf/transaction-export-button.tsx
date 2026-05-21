"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileDown } from "lucide-react"
import { PdfDownloadButton } from "./pdf-download-button"

interface Transaction {
  transaction_number: string
  type: "inward" | "outward"
  quantity: number
  unit_price: number
  transaction_date: string
  purpose?: string
  issued_to?: string
  challan_number?: string
  inventory_items: { name: string; code: string; unit: string } | null
  sites: { name: string } | null
  profiles: { full_name: string } | null
}

export function TransactionExportButton({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const [open, setOpen] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const oneEightyDaysAgo = new Date()
  oneEightyDaysAgo.setDate(oneEightyDaysAgo.getDate() - 180)
  const defaultFrom = oneEightyDaysAgo.toISOString().split("T")[0]

  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(today)

  const filtered = transactions.filter((tx) => {
    const d = tx.transaction_date
    return d >= dateFrom && d <= dateTo
  })

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Transaction Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
                max={today}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} in selected range
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <PdfDownloadButton
              fileName={`transactions-${dateFrom}-to-${dateTo}.pdf`}
              label="Download"
              documentFactory={async () => {
                const { TransactionSummaryPdf } = await import("./transaction-summary-pdf")
                return (
                  <TransactionSummaryPdf
                    transactions={filtered}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                )
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
