import { z } from "zod"

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  payment_date: z.string().min(1, "Select payment date"),
  payment_method: z.enum(["cash", "cheque", "bank_transfer", "upi", "other"]),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>
