"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { outwardSchema, type OutwardFormValues } from "@/lib/validations/transaction"
import { createOutwardTransaction } from "@/lib/actions/transactions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface OutwardFormProps {
  items: { id: string; name: string; code: string; unit: string; current_stock: number }[]
}

export function OutwardForm({ items }: OutwardFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<OutwardFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(outwardSchema) as any,
    defaultValues: {
      item_id: "",
      quantity: 0,
      issued_to: "",
      purpose: "",
      remarks: "",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  const selectedItemId = form.watch("item_id")
  const selectedItem = items.find((i) => i.id === selectedItemId)

  async function onSubmit(values: OutwardFormValues) {
    setLoading(true)
    const result = await createOutwardTransaction({
      ...values,
      remarks: values.remarks || undefined,
    })

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Outward transaction recorded")
    router.push("/transactions")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Material Issue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material">{field.value ? items.find((i: any) => i.id === field.value)?.name : undefined}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.code} - {item.name} (Stock: {item.current_stock} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantity {selectedItem ? `(${selectedItem.unit})` : ""}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="1" step="any" {...field} />
                  </FormControl>
                  {selectedItem && (
                    <p className="text-xs text-muted-foreground">
                      Available: {selectedItem.current_stock} {selectedItem.unit}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issued_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued To</FormLabel>
                  <FormControl>
                    <Input placeholder="Person or department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Floor casting Block A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Outward
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
