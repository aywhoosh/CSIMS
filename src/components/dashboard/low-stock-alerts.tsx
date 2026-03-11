import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface LowStockAlertsProps {
  items: any[]
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low Stock Alerts</CardTitle>
        {items.length > 0 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/alerts">View All</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All items are adequately stocked.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item: any) => {
              const isOutOfStock = item.current_stock === 0
              const percentage =
                item.minimum_stock > 0
                  ? Math.min(
                      Math.round((item.current_stock / item.minimum_stock) * 100),
                      100
                    )
                  : 0
              const barColor = isOutOfStock
                ? "bg-red-500"
                : percentage < 50
                  ? "bg-amber-500"
                  : "bg-amber-400"
              const iconColor = isOutOfStock ? "text-red-500" : "text-amber-500"

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
                      <div>
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : "text-amber-600"}`}>
                        {item.current_stock} {item.unit}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Min: {item.minimum_stock} ({percentage}%)
                      </p>
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
