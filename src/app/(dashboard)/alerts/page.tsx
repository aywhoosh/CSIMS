import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getLowStockItems } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, XCircle, RefreshCw } from "lucide-react"

export default async function AlertsPage() {
  const supabase = await createServerSupabaseClient()
  const lowStockItems = await getLowStockItems(supabase)

  const outOfStock = lowStockItems.filter((item: any) => item.current_stock === 0)
  const lowStock = lowStockItems.filter((item: any) => item.current_stock > 0)
  const reorderSuggestions = lowStockItems.filter(
    (item: any) => item.current_stock <= item.minimum_stock && item.reorder_quantity > 0
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Stock alerts and reorder suggestions"
      />

      <Tabs defaultValue="low-stock">
        <TabsList>
          <TabsTrigger value="low-stock">
            Low Stock ({lowStock.length})
          </TabsTrigger>
          <TabsTrigger value="out-of-stock">
            Out of Stock ({outOfStock.length})
          </TabsTrigger>
          <TabsTrigger value="reorder">
            Reorder ({reorderSuggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="low-stock" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low stock items.</p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current: <span className="font-semibold text-amber-600">{item.current_stock} {item.unit}</span>
                          {" | "}
                          Minimum: {item.minimum_stock} {item.unit}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inventory/${item.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out-of-stock" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Out of Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outOfStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">No out of stock items.</p>
              ) : (
                <div className="space-y-3">
                  {outOfStock.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <Badge variant="destructive" className="font-mono text-xs">{item.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stock: <span className="font-semibold text-destructive">0 {item.unit}</span>
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/transactions/inward/new">Record Inward</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Reorder Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reorderSuggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items need reordering.</p>
              ) : (
                <div className="space-y-3">
                  {reorderSuggestions.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current: {item.current_stock} {item.unit}
                          {" | "}
                          Suggested order: <span className="font-semibold text-blue-600">{item.reorder_quantity} {item.unit}</span>
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/purchase-orders/new">Create PO</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
