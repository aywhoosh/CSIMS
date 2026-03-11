"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CHART_COLORS } from "@/lib/constants"

interface StockLevelChartProps {
  data: { name: string; current_stock: number; minimum_stock: number; unit: string }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  const item = payload[0]?.payload
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
      <div className="space-y-0.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
          <span className="text-muted-foreground">Current Stock:</span>
          <span className="font-medium text-foreground">
            {item?.current_stock ?? 0} {item?.unit ?? ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.danger }} />
          <span className="text-muted-foreground">Min Stock:</span>
          <span className="font-medium text-foreground">
            {item?.minimum_stock ?? 0} {item?.unit ?? ""}
          </span>
        </div>
      </div>
    </div>
  )
}

export function StockLevelChart({ data }: StockLevelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No inventory data</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={1} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="barGradientDanger" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.danger} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={CHART_COLORS.danger} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) =>
                  value === "current_stock" ? "Current Stock" : "Min Stock"
                }
              />
              <Bar
                dataKey="current_stock"
                fill="url(#barGradientPrimary)"
                name="current_stock"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="minimum_stock"
                fill="url(#barGradientDanger)"
                name="minimum_stock"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
