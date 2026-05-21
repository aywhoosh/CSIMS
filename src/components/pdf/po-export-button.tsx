"use client"

import { PdfDownloadButton } from "./pdf-download-button"

interface PoExportButtonProps {
  po: any
  poNumber: string
}

export function PoExportButton({ po, poNumber }: PoExportButtonProps) {
  return (
    <PdfDownloadButton
      fileName={`${poNumber}.pdf`}
      label="Download PO"
      documentFactory={async () => {
        const { PoPdf } = await import("@/components/pdf/po-pdf")
        return <PoPdf po={po} />
      }}
    />
  )
}
