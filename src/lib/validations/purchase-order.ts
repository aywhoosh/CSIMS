import { z } from "zod"

export const poLineItemSchema = z.object({
  item_id: z.string().min(1, "Select an item"),
  quantity_ordered: z.coerce.number().positive("Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Must be 0 or greater"),
  tax_percent: z.coerce.number().min(0).max(100).default(18),
})

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Select a supplier"),
  site_id: z.string().min(1, "Select a site"),
  order_date: z.string().min(1, "Select order date"),
  expected_delivery_date: z.string().optional(),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(poLineItemSchema).min(1, "Add at least one line item"),
})

export type POLineItemFormValues = z.infer<typeof poLineItemSchema>
export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>
