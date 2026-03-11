import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"

interface RecentActivityProps {
  transactions: any[]
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent transactions.</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((txn: any) => {
              const isInward = txn.type === "inward"
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-md border-l-[3px] px-3 py-2.5 transition-colors hover:bg-muted/40"
                  style={{
                    borderLeftColor: isInward ? "#22C55E" : "#F97316",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={isInward ? "default" : "secondary"}
                      className="min-w-[38px] justify-center text-[10px] font-semibold"
                    >
                      {isInward ? "IN" : "OUT"}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {txn.inventory_items?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {txn.quantity} {txn.inventory_items?.unit}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRelativeTime(txn.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
