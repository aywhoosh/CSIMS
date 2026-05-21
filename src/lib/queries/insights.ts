import { type SupabaseClient } from "@supabase/supabase-js"

export type RiskLevel = "critical" | "high" | "medium" | "low" | "no_usage"

export interface StockRiskItem {
  id: string
  name: string
  code: string
  unit: string
  current_stock: number
  minimum_stock: number
  reorder_quantity: number
  unit_price: number
  category: string
  site: string
  totalUsed: number
  avgDailyConsumption: number
  daysRemaining: number | null
  riskLevel: RiskLevel
  riskExplanation: string
}

export interface ReorderItem {
  id: string
  name: string
  code: string
  unit: string
  current_stock: number
  minimum_stock: number
  reorder_quantity: number
  unit_price: number
  category: string
  site: string
  hasActivePO: boolean
  deficit: number
}

export interface CategoryTrend {
  week: string
  [category: string]: number | string
}

/** Calculate stockout risk for all active items based on recent outward transactions. */
export async function getStockoutRiskItems(
  supabase: SupabaseClient,
  daysBack: number
): Promise<StockRiskItem[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysBack)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const [{ data: items, error: itemErr }, { data: txns, error: txnErr }] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("id, name, code, unit, current_stock, minimum_stock, reorder_quantity, unit_price, categories(name), sites(name)")
      .eq("is_active", true),
    supabase
      .from("inventory_transactions")
      .select("item_id, quantity")
      .eq("type", "outward")
      .gte("transaction_date", cutoffStr),
  ])

  if (itemErr) throw itemErr
  if (txnErr) throw txnErr

  // Build usage map: item_id → total outward qty over period
  const usageMap: Record<string, number> = {}
  for (const tx of txns || []) {
    usageMap[tx.item_id] = (usageMap[tx.item_id] || 0) + tx.quantity
  }

  return (items || []).map((item) => {
    const totalUsed = usageMap[item.id] || 0
    const avgDailyConsumption = totalUsed / daysBack
    const daysRemaining =
      avgDailyConsumption > 0 ? Math.floor(item.current_stock / avgDailyConsumption) : null

    let riskLevel: RiskLevel
    let riskExplanation: string

    if (avgDailyConsumption === 0) {
      riskLevel = item.current_stock <= item.minimum_stock ? "high" : "no_usage"
      riskExplanation =
        item.current_stock <= item.minimum_stock
          ? `Stock (${item.current_stock} ${item.unit}) is at or below minimum (${item.minimum_stock} ${item.unit}) with no recent usage.`
          : `No outward transactions in the last ${daysBack} days.`
    } else if (daysRemaining !== null && daysRemaining <= 7) {
      riskLevel = "critical"
      riskExplanation = `At current usage rate, stock will run out in ~${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`
    } else if (daysRemaining !== null && daysRemaining <= 14) {
      riskLevel = "high"
      riskExplanation = `Approximately ${daysRemaining} days of stock remaining at current usage.`
    } else if (daysRemaining !== null && daysRemaining <= 30) {
      riskLevel = "medium"
      riskExplanation = `Approximately ${daysRemaining} days of stock remaining.`
    } else {
      riskLevel = "low"
      riskExplanation = daysRemaining
        ? `Over ${daysRemaining} days of stock remaining.`
        : `Stock appears sufficient.`
    }

    // Minimum stock breach override
    if (item.current_stock <= item.minimum_stock && (riskLevel === "low" || riskLevel === "medium")) {
      riskLevel = "high"
      riskExplanation = `Stock (${item.current_stock} ${item.unit}) is at or below minimum threshold (${item.minimum_stock} ${item.unit}).`
    }

    return {
      id: item.id,
      name: item.name,
      code: item.code,
      unit: item.unit,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      reorder_quantity: item.reorder_quantity,
      unit_price: item.unit_price,
      category: (item.categories as any)?.name ?? "—",
      site: (item.sites as any)?.name ?? "—",
      totalUsed,
      avgDailyConsumption: Math.round(avgDailyConsumption * 100) / 100,
      daysRemaining,
      riskLevel,
      riskExplanation,
    }
  })
}

/** Items at or below their reorder quantity, with a flag indicating an active PO exists. */
export async function getReorderRecommendations(
  supabase: SupabaseClient
): Promise<ReorderItem[]> {
  // Fetch all active items and active POs in parallel
  const [{ data: items, error: itemErr }, { data: activePOs, error: poErr }] =
    await Promise.all([
      supabase
        .from("inventory_items")
        .select("id, name, code, unit, current_stock, minimum_stock, reorder_quantity, unit_price, categories(name), sites(name)")
        .eq("is_active", true),
      supabase
        .from("purchase_orders")
        .select("id")
        .in("status", ["draft", "sent", "partially_received"]),
    ])

  if (itemErr) throw itemErr
  if (poErr) throw poErr

  // Get items that appear in those active POs
  let activePOSet = new Set<string>()
  const activePOIds = (activePOs || []).map((po: any) => po.id)
  if (activePOIds.length > 0) {
    const { data: poItems } = await supabase
      .from("purchase_order_items")
      .select("item_id")
      .in("purchase_order_id", activePOIds)
    activePOSet = new Set((poItems || []).map((p: any) => p.item_id))
  }

  // Client-side: only items at or below their reorder quantity
  return (items || [])
    .filter((item) => item.current_stock <= item.reorder_quantity)
    .map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      unit: item.unit,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      reorder_quantity: item.reorder_quantity,
      unit_price: item.unit_price,
      category: (item.categories as any)?.name ?? "—",
      site: (item.sites as any)?.name ?? "—",
      hasActivePO: activePOSet.has(item.id),
      deficit: Math.max(0, item.reorder_quantity - item.current_stock),
    }))
}

/** Weekly outward consumption totals per category for the last N days. */
export async function getCategoryConsumptionTrend(
  supabase: SupabaseClient,
  daysBack: number
): Promise<{ categories: string[]; weeks: CategoryTrend[] }> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysBack)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const { data: txns, error } = await supabase
    .from("inventory_transactions")
    .select("quantity, transaction_date, inventory_items!inner(categories(name))")
    .eq("type", "outward")
    .gte("transaction_date", cutoffStr)
    .order("transaction_date")

  if (error) throw error

  const weekMap: Record<string, Record<string, number>> = {}
  const categorySet = new Set<string>()

  for (const tx of txns || []) {
    const category = (tx.inventory_items as any)?.categories?.name ?? "Other"
    categorySet.add(category)

    // ISO week key: YYYY-W## format
    const date = new Date(tx.transaction_date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay() + 1) // Monday
    const weekKey = weekStart.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })

    if (!weekMap[weekKey]) weekMap[weekKey] = {}
    weekMap[weekKey][category] = (weekMap[weekKey][category] || 0) + tx.quantity
  }

  const categories = Array.from(categorySet).sort()
  const weeks: CategoryTrend[] = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      ...Object.fromEntries(categories.map((cat) => [cat, data[cat] || 0])),
    }))

  return { categories, weeks }
}

/** Summary KPIs for the insights dashboard header cards. */
export async function getInsightsSummary(supabase: SupabaseClient, daysBack: number) {
  const items = await getStockoutRiskItems(supabase, daysBack)

  const critical = items.filter((i) => i.riskLevel === "critical").length
  const high = items.filter((i) => i.riskLevel === "high").length
  const atRisk = critical + high
  const needReorder = items.filter((i) => i.current_stock <= i.reorder_quantity).length

  const withDays = items.filter((i) => i.daysRemaining !== null)
  const avgDaysRemaining =
    withDays.length > 0
      ? Math.round(withDays.reduce((s, i) => s + (i.daysRemaining ?? 0), 0) / withDays.length)
      : null

  return { critical, high, atRisk, needReorder, avgDaysRemaining, total: items.length }
}
