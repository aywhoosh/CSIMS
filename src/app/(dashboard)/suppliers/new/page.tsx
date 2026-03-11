import { PageHeader } from "@/components/shared/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Supplier" description="Add a new supplier to the system" />
      <SupplierForm />
    </div>
  )
}
