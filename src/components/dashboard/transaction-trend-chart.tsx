"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CHART_COLORS } from "@/lib/constants"

interface TransactionTrendChartProps {
  data: { date: string; inward: number; outward: number }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-foreground">
        {new Date(label).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
      <div className="space-y-0.5 text-xs">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TransactionTrendChart({ data }: TransactionTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Trends (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transaction data</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradientInward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="areaGradientOutward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.quaternary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.quaternary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)' }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="inward"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                fill="url(#areaGradientInward)"
                name="Inward"
                activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: CHART_COLORS.success }}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="outward"
                stroke={CHART_COLORS.quaternary}
                strokeWidth={2}
                fill="url(#areaGradientOutward)"
                name="Outward"
                activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: CHART_COLORS.quaternary }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
