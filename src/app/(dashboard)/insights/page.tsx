import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  getStockoutRiskItems,
  getReorderRecommendations,
  getCategoryConsumptionTrend,
  getInsightsSummary,
} from "@/lib/queries/insights"
import { KPICard } from "@/components/shared/kpi-card"
import { RiskTable } from "@/components/insights/risk-table"
import { ReorderPanel } from "@/components/insights/reorder-panel"
import { ConsumptionChart } from "@/components/insights/consumption-chart"
import { DaysSelector } from "@/components/insights/days-selector"
import { PageHeader } from "@/components/shared/page-header"
import { AlertTriangle, TrendingDown, ShoppingCart, Clock, BarChart3 } from "lucide-react"

interface InsightsPageProps {
  searchParams: Promise<{ days?: string }>
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const { days } = await searchParams
  const daysBack = Math.min(Math.max(parseInt(days || "30", 10) || 30, 7), 90)

  const supabase = await createServerSupabaseClient()

  const [riskItems, reorderItems, { categories, weeks }, summary] = await Promise.all([
    getStockoutRiskItems(supabase, daysBack),
    getReorderRecommendations(supabase),
    getCategoryConsumptionTrend(supabase, daysBack),
    getInsightsSummary(supabase, daysBack),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <PageHeader
          title="Inventory Insights"
          description="Stockout forecasts and reorder recommendations based on consumption history."
        />
        <Suspense fallback={null}>
          <DaysSelector current={daysBack} />
        </Suspense>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Items at Risk"
          value={summary.atRisk}
          icon={AlertTriangle}
          description={`Critical (${summary.critical}) + High (${summary.high})`}
          trend={summary.atRisk > 0 ? "down" : "up"}
          iconColor="text-destructive"
        />
        <KPICard
          title="Critical Items"
          value={summary.critical}
          icon={TrendingDown}
          description="Stock out within 7 days"
          trend={summary.critical > 0 ? "down" : "up"}
          iconColor={summary.critical > 0 ? "text-destructive" : "text-green-600"}
        />
        <KPICard
          title="Reorder Needed"
          value={summary.needReorder}
          icon={ShoppingCart}
          description="Below reorder threshold"
          trend={summary.needReorder > 0 ? "down" : "up"}
          iconColor="text-amber-600"
        />
        <KPICard
          title="Avg Days Remaining"
          value={summary.avgDaysRemaining !== null ? `${summary.avgDaysRemaining}d` : "—"}
          icon={Clock}
          description={`Across ${summary.total} active items`}
          iconColor="text-blue-600"
        />
      </div>

      {/* Consumption chart */}
      <ConsumptionChart categories={categories} weeks={weeks} daysBack={daysBack} />

      {/* Risk table (full width) */}
      <RiskTable items={riskItems} />

      {/* Reorder recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReorderPanel items={reorderItems} />
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-primary" />
            How risk is calculated
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>
              <strong className="text-foreground">Average daily consumption</strong> is calculated from
              all outward transactions in the selected period.
            </li>
            <li>
              <strong className="text-foreground">Days remaining</strong> = Current stock ÷ Avg daily use.
              Items with no recent outward activity show "—".
            </li>
            <li>
              <strong className="text-red-600">Critical</strong> — stock runs out in ≤7 days at current rate.
            </li>
            <li>
              <strong className="text-orange-600">High</strong> — ≤14 days remaining, or stock below minimum threshold.
            </li>
            <li>
              <strong className="text-yellow-600">Medium</strong> — ≤30 days remaining.
            </li>
            <li>
              <strong className="text-green-600">Low</strong> — stock is well within safe range.
            </li>
            <li>
              <strong className="text-muted-foreground">No Usage</strong> — no outward transactions in the period; monitor manually.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
