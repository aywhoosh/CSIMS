"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryTrend } from "@/lib/queries/insights"

const CATEGORY_COLORS = [
  "#8CB82B", "#58585A", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#10B981", "#F97316", "#EC4899",
]

interface ConsumptionChartProps {
  categories: string[]
  weeks: CategoryTrend[]
  daysBack: number
}

export function ConsumptionChart({ categories, weeks, daysBack }: ConsumptionChartProps) {
  if (weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consumption by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No outward transactions recorded in the last {daysBack} days.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Show only top-6 categories by total volume to keep chart readable
  const categoryTotals = categories.map((cat) => ({
    cat,
    total: weeks.reduce((s, w) => s + ((w[cat] as number) || 0), 0),
  }))
  const topCategories = categoryTotals
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map((c) => c.cat)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consumption by Category (Last {daysBack} Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeks} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {topCategories.map((cat, i) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="a"
                fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                radius={i === topCategories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
