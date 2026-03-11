import { z } from "zod"

export const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Enter invoice number"),
  purchase_order_id: z.string().optional(),
  supplier_id: z.string().min(1, "Select a supplier"),
  site_id: z.string().min(1, "Select a site"),
  invoice_date: z.string().min(1, "Select invoice date"),
  due_date: z.string().min(1, "Select due date"),
  subtotal: z.coerce.number().min(0),
  tax_amount: z.coerce.number().min(0).default(0),
  total_amount: z.coerce.number().positive("Total must be greater than 0"),
  notes: z.string().optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
