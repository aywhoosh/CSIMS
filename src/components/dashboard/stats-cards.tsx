import { KPICard } from "@/components/shared/kpi-card"
import { formatCurrency } from "@/lib/utils"
import {
  Package,
  AlertTriangle,
  ClipboardList,
  FileWarning,
  IndianRupee,
  ArrowLeftRight,
} from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalItems: number
    lowStockCount: number
    pendingPOs: number
    overdueInvoices: number
    totalValue: number
    todayTransactions: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Total Materials"
        value={stats.totalItems}
        icon={Package}
        description="Active inventory items"
        iconColor="text-primary"
      />
      <KPICard
        title="Low Stock Items"
        value={stats.lowStockCount}
        icon={AlertTriangle}
        description="At or below minimum level"
        trend={stats.lowStockCount > 0 ? "down" : "neutral"}
        iconColor={stats.lowStockCount > 0 ? "text-amber-500" : "text-primary"}
      />
      <KPICard
        title="Pending POs"
        value={stats.pendingPOs}
        icon={ClipboardList}
        description="Draft, sent, or partially received"
        iconColor="text-blue-500"
      />
      <KPICard
        title="Overdue Invoices"
        value={stats.overdueInvoices}
        icon={FileWarning}
        description="Past due date"
        trend={stats.overdueInvoices > 0 ? "down" : "neutral"}
        iconColor={stats.overdueInvoices > 0 ? "text-destructive" : "text-primary"}
      />
      <KPICard
        title="Inventory Value"
        value={formatCurrency(stats.totalValue)}
        icon={IndianRupee}
        description="Total stock value"
        iconColor="text-emerald-600"
      />
      <KPICard
        title="Today's Transactions"
        value={stats.todayTransactions}
        icon={ArrowLeftRight}
        description="Inward + outward movements"
        iconColor="text-violet-500"
      />
    </div>
  )
}
