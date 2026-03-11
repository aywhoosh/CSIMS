import { z } from "zod"

export const inwardSchema = z.object({
  item_id: z.string().min(1, "Select an item"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  rejected_quantity: z.coerce.number().min(0, "Must be 0 or greater").default(0),
  unit_price: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  purchase_order_id: z.string().optional(),
  challan_number: z.string().optional(),
  vehicle_number: z.string().optional(),
  remarks: z.string().optional(),
  transaction_date: z.string().min(1, "Select a date"),
}).refine(
  (data) => data.rejected_quantity <= data.quantity,
  { message: "Rejected quantity cannot exceed received quantity", path: ["rejected_quantity"] }
)

export type InwardFormValues = z.infer<typeof inwardSchema>

export const outwardSchema = z.object({
  item_id: z.string().min(1, "Select an item"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  issued_to: z.string().min(1, "Enter who it was issued to"),
  purpose: z.string().min(1, "Enter the purpose"),
  remarks: z.string().optional(),
  transaction_date: z.string().min(1, "Select a date"),
})

export type OutwardFormValues = z.infer<typeof outwardSchema>
