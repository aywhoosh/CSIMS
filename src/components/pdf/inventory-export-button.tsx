"use client"

import { PdfDownloadButton } from "./pdf-download-button"

interface InventoryItem {
  id: string
  name: string
  code: string
  unit: string
  current_stock: number
  minimum_stock: number
  reorder_quantity: number
  unit_price: number
  categories: { name: string } | null
  sites: { name: string } | null
  storage_locations: { name: string } | null
}

export function InventoryExportButton({ items }: { items: InventoryItem[] }) {
  return (
    <PdfDownloadButton
      fileName={`inventory-report-${new Date().toISOString().split("T")[0]}.pdf`}
      label="Export PDF"
      variant="outline"
      documentFactory={async () => {
        const { InventoryPdf } = await import("./inventory-pdf")
        return <InventoryPdf items={items} />
      }}
    />
  )
}
