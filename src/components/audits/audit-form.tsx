"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { auditSchema, type AuditFormValues } from "@/lib/validations/audit"
import { createAudit } from "@/lib/actions/audits"
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
import { Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface AuditFormProps {
  sites: { id: string; name: string }[]
  items: { id: string; name: string; code: string; unit: string; current_stock: number; site_id: string }[]
}

export function AuditForm({ sites, items }: AuditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<AuditFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(auditSchema) as any,
    defaultValues: {
      site_id: "",
      audit_date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const selectedSiteId = form.watch("site_id")
  const siteItems = items.filter((i) => i.site_id === selectedSiteId)

  function addItem() {
    append({
      item_id: "",
      system_quantity: 0,
      physical_quantity: 0,
      variance_reason: "",
    })
  }

  async function onSubmit(values: AuditFormValues) {
    setLoading(true)
    const result = await createAudit(values)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Stock audit created")
    router.push("/audits")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="site_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      // Clear items when site changes
                      form.setValue("items", [])
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site">{field.value ? sites.find((s: any) => s.id === field.value)?.name : undefined}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="audit_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Audit notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Audit Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={!selectedSiteId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSiteId && (
              <p className="text-sm text-muted-foreground">Select a site first to add items.</p>
            )}
            {fields.map((field, index) => {
              const watchedItemId = form.watch(`items.${index}.item_id`)
              const selectedItem = siteItems.find((i) => i.id === watchedItemId)
              const systemQty = form.watch(`items.${index}.system_quantity`)
              const physicalQty = form.watch(`items.${index}.physical_quantity`)
              const variance = physicalQty - systemQty

              return (
                <div key={field.id} className="rounded-lg border p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.item_id`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Material</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val)
                              const item = siteItems.find((i) => i.id === val)
                              if (item) {
                                form.setValue(`items.${index}.system_quantity`, item.current_stock)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item">{field.value ? siteItems.find((i: any) => i.id === field.value)?.name : undefined}</SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {siteItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.code} - {item.name}
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
                      name={`items.${index}.system_quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Qty</FormLabel>
                          <FormControl>
                            <Input type="number" disabled {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.physical_quantity`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Physical Qty</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="any" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="mb-0.5"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedItem && (
                      <span
                        className={`text-sm font-medium ${
                          variance < 0 ? "text-destructive" : variance > 0 ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        Variance: {variance > 0 ? "+" : ""}{variance} {selectedItem.unit}
                      </span>
                    )}
                    <FormField
                      control={form.control}
                      name={`items.${index}.variance_reason`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Reason for variance (if any)" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )
            })}
            {form.formState.errors.items?.root && (
              <p className="text-sm text-destructive">{form.formState.errors.items.root.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || fields.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Audit
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
