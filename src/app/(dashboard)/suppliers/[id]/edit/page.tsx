import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSupplierById } from "@/lib/queries/suppliers"
import { PageHeader } from "@/components/shared/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default async function EditSupplierPage({
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
      <PageHeader title="Edit Supplier" description={`Editing ${supplier.name}`} />
      <SupplierForm initialData={supplier} isEditing />
    </div>
  )
}
