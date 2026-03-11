import { type SupabaseClient } from "@supabase/supabase-js"

export async function getDashboardStats(supabase: SupabaseClient) {
  const [
    { count: totalItems },
    { data: lowStockItems },
    { count: pendingPOs },
    { count: overdueInvoices },
    { data: allItems },
    { count: todayTransactions },
  ] = await Promise.all([
    supabase.from("inventory_items").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("inventory_items").select("current_stock, minimum_stock").eq("is_active", true),
    supabase.from("purchase_orders").select("*", { count: "exact", head: true }).in("status", ["draft", "sent", "partially_received"]),
    supabase.from("invoices").select("*", { count: "exact", head: true }).in("status", ["pending", "partially_paid"]).lt("due_date", new Date().toISOString().split("T")[0]),
    supabase.from("inventory_items").select("current_stock, unit_price").eq("is_active", true),
    supabase.from("inventory_transactions").select("*", { count: "exact", head: true }).eq("transaction_date", new Date().toISOString().split("T")[0]),
  ])

  const lowStockCount = (lowStockItems || []).filter(
    (item) => item.current_stock <= item.minimum_stock
  ).length

  const totalValue = (allItems || []).reduce(
    (sum, item) => sum + item.current_stock * item.unit_price,
    0
  )

  return {
    totalItems: totalItems || 0,
    lowStockCount,
    pendingPOs: pendingPOs || 0,
    overdueInvoices: overdueInvoices || 0,
    totalValue,
    todayTransactions: todayTransactions || 0,
  }
}

export async function getCategoryDistribution(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("categories(name), current_stock, unit_price")
    .eq("is_active", true)

  if (error) throw error

  const distribution: Record<string, number> = {}
  for (const item of data || []) {
    const category = (item.categories as any)?.name || "Other"
    distribution[category] = (distribution[category] || 0) + item.current_stock * item.unit_price
  }

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
}

export async function getTransactionTrends(supabase: SupabaseClient) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from("inventory_transactions")
    .select("type, quantity, transaction_date")
    .gte("transaction_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("transaction_date")

  if (error) throw error

  const trends: Record<string, { date: string; inward: number; outward: number }> = {}
  for (const txn of data || []) {
    if (!trends[txn.transaction_date]) {
      trends[txn.transaction_date] = { date: txn.transaction_date, inward: 0, outward: 0 }
    }
    if (txn.type === "inward") {
      trends[txn.transaction_date].inward += Number(txn.quantity)
    } else {
      trends[txn.transaction_date].outward += Number(txn.quantity)
    }
  }

  return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date))
}
