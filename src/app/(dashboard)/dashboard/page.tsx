import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  getDashboardStats,
  getCategoryDistribution,
  getTransactionTrends,
} from "@/lib/queries/dashboard"
import { getLowStockItems, getInventoryItems } from "@/lib/queries/inventory"
import { getRecentTransactions } from "@/lib/queries/transactions"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { StockLevelChart } from "@/components/dashboard/stock-level-chart"
import { TransactionTrendChart } from "@/components/dashboard/transaction-trend-chart"
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [stats, categoryDist, trends, lowStock, recentTxns, allItems] = await Promise.all([
    getDashboardStats(supabase),
    getCategoryDistribution(supabase),
    getTransactionTrends(supabase),
    getLowStockItems(supabase),
    getRecentTransactions(supabase, 5),
    getInventoryItems(supabase),
  ])

  const stockLevelData = allItems
    .sort((a: any, b: any) => b.current_stock - a.current_stock)
    .slice(0, 10)
    .map((item: any) => ({
      name: item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      unit: item.unit,
    }))

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory management</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{formattedDate}</p>
          <p>Blessing Homz Pvt Ltd</p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StockLevelChart data={stockLevelData} />
        <TransactionTrendChart data={trends} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDistributionChart data={categoryDist} />
        <div className="space-y-6">
          <RecentActivity transactions={recentTxns} />
          <LowStockAlerts items={lowStock} />
        </div>
      </div>
    </div>
  )
}
