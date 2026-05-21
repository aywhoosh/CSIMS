"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StockRiskItem, RiskLevel } from "@/lib/queries/insights"

const RISK_CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  low: { label: "Low", className: "bg-green-100 text-green-700 border-green-200" },
  no_usage: { label: "No Usage", className: "bg-muted text-muted-foreground border-border" },
}

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  no_usage: 4,
}

type SortKey = "riskLevel" | "daysRemaining" | "avgDailyConsumption" | "current_stock"
type SortDir = "asc" | "desc"

interface RiskTableProps {
  items: StockRiskItem[]
}

const FILTER_OPTIONS: { label: string; value: RiskLevel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
  { label: "No Usage", value: "no_usage" },
]

export function RiskTable({ items }: RiskTableProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<RiskLevel | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("riskLevel")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  const filtered = items
    .filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === "all" || item.riskLevel === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === "riskLevel") cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]
      else if (sortKey === "daysRemaining") {
        const aD = a.daysRemaining ?? 9999
        const bD = b.daysRemaining ?? 9999
        cmp = aD - bD
      } else if (sortKey === "avgDailyConsumption") cmp = a.avgDailyConsumption - b.avgDailyConsumption
      else if (sortKey === "current_stock") cmp = a.current_stock - b.current_stock
      return sortDir === "asc" ? cmp : -cmp
    })

  const counts = {
    critical: items.filter((i) => i.riskLevel === "critical").length,
    high: items.filter((i) => i.riskLevel === "high").length,
    medium: items.filter((i) => i.riskLevel === "medium").length,
    low: items.filter((i) => i.riskLevel === "low").length,
    no_usage: items.filter((i) => i.riskLevel === "no_usage").length,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Stockout Risk by Item</CardTitle>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {FILTER_OPTIONS.map((opt) => {
            const count = opt.value === "all" ? items.length : counts[opt.value as RiskLevel]
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors",
                  filter === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1 rounded-full",
                    filter === opt.value ? "bg-primary-foreground/20" : "bg-background"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                  Material
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Current</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Min</th>
                <SortHeader
                  label="Avg Daily Use"
                  sortKey="avgDailyConsumption"
                  current={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Days Left"
                  sortKey="daysRemaining"
                  current={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Risk"
                  sortKey="riskLevel"
                  current={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No items match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const risk = RISK_CONFIG[item.riskLevel]
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium leading-tight">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">{item.code} · {item.site}</div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.category}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {item.current_stock} <span className="text-muted-foreground text-xs">{item.unit}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {item.minimum_stock}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {item.avgDailyConsumption > 0 ? (
                          <>
                            {item.avgDailyConsumption}{" "}
                            <span className="text-muted-foreground text-xs">{item.unit}/day</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {item.daysRemaining !== null ? (
                          <span
                            className={cn(
                              "font-semibold",
                              item.daysRemaining <= 7
                                ? "text-red-600"
                                : item.daysRemaining <= 14
                                  ? "text-orange-600"
                                  : "text-foreground"
                            )}
                          >
                            {item.daysRemaining}d
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium whitespace-nowrap", risk.className)}
                        >
                          {risk.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs text-muted-foreground leading-snug">{item.riskExplanation}</p>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground px-4 py-2 border-t">
            Showing {filtered.length} of {items.length} items
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  return (
    <th className="px-3 py-2.5 text-right">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "ml-1 h-3 w-3",
            current === sortKey ? "text-primary" : "opacity-40"
          )}
        />
      </Button>
    </th>
  )
}
