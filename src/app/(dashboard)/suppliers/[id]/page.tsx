import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSupplierById } from "@/lib/queries/suppliers"
import { formatDate } from "@/lib/utils"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil } from "lucide-react"

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  let supplier
  try {
    supplier = await getSupplierById(supabase, id)
  } catch {
    notFound()
  }

  if (!supplier) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/suppliers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{supplier.name}</h1>
              <Badge variant="outline">{supplier.code}</Badge>
              <Badge variant={supplier.is_active ? "default" : "secondary"}>
                {supplier.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {supplier.contact_person && (
              <p className="text-sm text-muted-foreground">
                Contact: {supplier.contact_person}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/suppliers/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span>{supplier.phone}</span>
            </div>
            {supplier.alternate_phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alternate Phone</span>
                <span>{supplier.alternate_phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span>{supplier.email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">GST Number</span>
              <span className="font-mono text-sm">{supplier.gst_number || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">PAN Number</span>
              <span className="font-mono text-sm">{supplier.pan_number || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplier.address && (
              <div>
                <span className="text-sm text-muted-foreground">Street</span>
                <p className="mt-1 text-sm">{supplier.address}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">City</span>
              <span>{supplier.city || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">State</span>
              <span>{supplier.state || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pincode</span>
              <span>{supplier.pincode || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span>{supplier.bank_name || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account No.</span>
              <span className="font-mono text-sm">{supplier.bank_account_number || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">IFSC</span>
              <span className="font-mono text-sm">{supplier.bank_ifsc || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {supplier.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{supplier.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Record Info</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div>
              <span className="text-sm text-muted-foreground">Created</span>
              <p className="text-sm">{formatDate(supplier.created_at)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Updated</span>
              <p className="text-sm">{formatDate(supplier.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
