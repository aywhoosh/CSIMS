"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"

interface PdfDownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  fileName: string
  /** A factory that returns the PDF document React element. Dynamically imported to avoid SSR. */
  documentFactory: () => Promise<React.ReactElement>
  label?: string
}

export function PdfDownloadButton({
  fileName,
  documentFactory,
  label = "Download PDF",
  variant = "outline",
  size,
  className,
  ...rest
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (loading) return
    setLoading(true)
    try {
      const [{ pdf }, docElement] = await Promise.all([
        import("@react-pdf/renderer"),
        documentFactory(),
      ])
      const blob = await pdf(docElement).toBlob()
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      {loading ? "Generating..." : label}
    </Button>
  )
}
