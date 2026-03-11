import { z } from "zod"

export const auditItemSchema = z.object({
  item_id: z.string(),
  system_quantity: z.coerce.number(),
  physical_quantity: z.coerce.number().min(0, "Physical quantity must be 0 or greater"),
  variance_reason: z.string().optional(),
})

export const auditSchema = z.object({
  site_id: z.string().min(1, "Select a site"),
  audit_date: z.string().min(1, "Select audit date"),
  notes: z.string().optional(),
  items: z.array(auditItemSchema).min(1, "Add at least one item"),
})

export type AuditItemFormValues = z.infer<typeof auditItemSchema>
export type AuditFormValues = z.infer<typeof auditSchema>
