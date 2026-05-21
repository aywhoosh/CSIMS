"use client"

import { PdfDownloadButton } from "./pdf-download-button"

interface InvoiceExportButtonProps {
  invoice: any
  invoiceNumber: string
}

export function InvoiceExportButton({ invoice, invoiceNumber }: InvoiceExportButtonProps) {
  return (
    <PdfDownloadButton
      fileName={`${invoiceNumber}.pdf`}
      label="Download Invoice"
      documentFactory={async () => {
        const { InvoicePdf } = await import("@/components/pdf/invoice-pdf")
        return <InvoicePdf invoice={invoice} />
      }}
    />
  )
}
