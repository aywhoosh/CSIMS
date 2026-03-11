"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CHART_COLOR_ARRAY } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

interface CategoryDistributionChartProps {
  data: { name: string; value: number }[]
}

const RADIAN = Math.PI / 180

function renderOuterLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: any) {
  if ((percent ?? 0) < 0.04) return null
  const radius = outerRadius + 20
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      className="fill-foreground"
    >
      {name} ({((percent ?? 0) * 100).toFixed(0)}%)
    </text>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const entry = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: entry.payload?.fill }}
        />
        <span className="text-sm font-medium text-foreground">{entry.name}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatCurrency(Number(entry.value ?? 0))}
      </p>
    </div>
  )
}

function CustomLegend({ payload }: any) {
  if (!payload || !payload.length) return null

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Value by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No category data</p>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={95}
                dataKey="value"
                label={renderOuterLabel}
                labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend
                verticalAlign="bottom"
                content={<CustomLegend />}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
