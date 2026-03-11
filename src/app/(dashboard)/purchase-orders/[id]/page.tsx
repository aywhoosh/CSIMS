import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getPurchaseOrderById } from "@/lib/queries/purchase-orders"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PODetail } from "@/components/purchase-orders/po-detail"

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  let po
  try {
    po = await getPurchaseOrderById(supabase, id)
  } catch {
    notFound()
  }

  if (!po) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/purchase-orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Purchase Order {po.po_number}</h1>
          <p className="text-sm text-muted-foreground">
            Created on {new Date(po.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <PODetail po={po} />
    </div>
  )
}
