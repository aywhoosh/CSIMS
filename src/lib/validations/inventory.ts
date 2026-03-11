import { z } from "zod"

export const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category_id: z.string().min(1, "Select a category"),
  site_id: z.string().min(1, "Select a site"),
  storage_location_id: z.string().optional(),
  unit: z.string().min(1, "Select a unit"),
  minimum_stock: z.coerce.number().min(0, "Must be 0 or greater"),
  reorder_quantity: z.coerce.number().min(0, "Must be 0 or greater"),
  unit_price: z.coerce.number().min(0, "Must be 0 or greater"),
  description: z.string().optional(),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>
