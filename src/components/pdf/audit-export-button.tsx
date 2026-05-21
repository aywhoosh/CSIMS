"use client"

import { PdfDownloadButton } from "./pdf-download-button"

interface AuditExportButtonProps {
  audit: any
  auditNumber: string
}

export function AuditExportButton({ audit, auditNumber }: AuditExportButtonProps) {
  return (
    <PdfDownloadButton
      fileName={`${auditNumber}.pdf`}
      label="Download Report"
      documentFactory={async () => {
        const { AuditPdf } = await import("@/components/pdf/audit-pdf")
        return <AuditPdf audit={audit} />
      }}
    />
  )
}
