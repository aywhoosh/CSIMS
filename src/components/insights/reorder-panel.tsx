"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReorderItem } from "@/lib/queries/insights"

interface ReorderPanelProps {
  items: ReorderItem[]
}

export function ReorderPanel({ items }: ReorderPanelProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Reorder Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm font-medium">All stock levels are adequate</p>
            <p className="text-xs text-muted-foreground">No items require reordering at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const needAction = items.filter((i) => !i.hasActivePO)
  const alreadyOrdered = items.filter((i) => i.hasActivePO)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Reorder Recommendations
          </CardTitle>
          <div className="flex gap-1.5">
            {needAction.length > 0 && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                {needAction.length} need action
              </Badge>
            )}
            {alreadyOrdered.length > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {alreadyOrdered.length} PO active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors",
              item.hasActivePO ? "bg-blue-50/50 border-blue-100" : "bg-orange-50/50 border-orange-100"
            )}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {item.hasActivePO ? (
                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-sm leading-tight truncate">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.code}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.category} · {item.site}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-muted-foreground">Stock: </span>
                  <span className="font-medium">{item.current_stock} {item.unit}</span>
                  <span className="text-muted-foreground"> / Reorder point: {item.reorder_quantity} {item.unit}</span>
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold">
                +{item.deficit} {item.unit}
              </div>
              <div className="text-[10px] text-muted-foreground">suggested qty</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                ≈ ₹{Math.round(item.deficit * item.unit_price).toLocaleString("en-IN")}
              </div>
              {item.hasActivePO && (
                <Badge variant="outline" className="text-[10px] mt-1 bg-blue-50 text-blue-600 border-blue-200">
                  PO active
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
