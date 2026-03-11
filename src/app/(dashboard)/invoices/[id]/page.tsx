import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getInvoiceById } from "@/lib/queries/invoices"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { InvoiceDetail } from "@/components/invoices/invoice-detail"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  let invoice
  try {
    invoice = await getInvoiceById(supabase, id)
  } catch {
    notFound()
  }

  if (!invoice) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">
            {(invoice.suppliers as any)?.name}
          </p>
        </div>
      </div>
      <InvoiceDetail invoice={invoice} />
    </div>
  )
}
