import { tool } from "ai"
import { z } from "zod"
import { type SupabaseClient } from "@supabase/supabase-js"

/**
 * Builds predefined read-only tools for the Fuse chatbot.
 * All tools perform SELECT-only queries — no data mutations.
 */
export function buildTools(supabase: SupabaseClient) {
  return {
    get_low_stock_items: tool({
      description:
        "Get inventory items that are at or below their minimum stock threshold. " +
        "Use for questions about materials running low, what needs ordering, or stock shortages.",
      inputSchema: z.object({
        site_name: z
          .string()
          .optional()
          .describe('Filter by site name, e.g. "Site 1". Omit for all sites.'),
      }),
      execute: async ({ site_name }: { site_name?: string }) => {
        const { data, error } = await supabase
          .from("inventory_items")
          .select("name, code, unit, current_stock, minimum_stock, reorder_quantity, categories(name), sites(name)")
          .eq("is_active", true)
          .order("current_stock", { ascending: true })

        if (error) return { error: error.message }

        const filtered = (data || []).filter((item) => {
          const belowMin = item.current_stock <= item.minimum_stock
          const siteMatch = !site_name || (item.sites as any)?.name?.toLowerCase().includes(site_name.toLowerCase())
          return belowMin && siteMatch
        })

        return {
          count: filtered.length,
          items: filtered.map((item) => ({
            name: item.name,
            code: item.code,
            unit: item.unit,
            current_stock: item.current_stock,
            minimum_stock: item.minimum_stock,
            reorder_quantity: item.reorder_quantity,
            category: (item.categories as any)?.name,
            site: (item.sites as any)?.name,
            deficit: Math.max(0, item.minimum_stock - item.current_stock),
          })),
        }
      },
    }),

    get_stock_risk_summary: tool({
      description:
        "Calculate stockout risk for inventory items by analysing recent consumption (outward transactions). " +
        "Returns days-remaining estimates and risk levels (critical/high/medium/low). " +
        "Use for risk summaries, forecasts, or 'how long will stock last' questions.",
      inputSchema: z.object({
        site_name: z
          .string()
          .optional()
          .describe("Filter by site name. Omit for all sites."),
        days_back: z
          .number()
          .optional()
          .describe("Number of past days to analyse usage. Defaults to 30."),
        risk_level: z
          .enum(["critical", "high", "medium", "low", "all"])
          .optional()
          .describe("Filter by risk level. Defaults to 'all'."),
      }),
      execute: async ({
        site_name,
        days_back = 30,
        risk_level = "all",
      }: {
        site_name?: string
        days_back?: number
        risk_level?: "critical" | "high" | "medium" | "low" | "all"
      }) => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days_back)
        const cutoffStr = cutoff.toISOString().split("T")[0]

        const [{ data: items, error: itemErr }, { data: txns, error: txnErr }] =
          await Promise.all([
            supabase
              .from("inventory_items")
              .select("id, name, code, unit, current_stock, minimum_stock, reorder_quantity, categories(name), sites(name)")
              .eq("is_active", true),
            supabase
              .from("inventory_transactions")
              .select("item_id, quantity")
              .eq("type", "outward")
              .gte("transaction_date", cutoffStr),
          ])

        if (itemErr) return { error: itemErr.message }
        if (txnErr) return { error: txnErr.message }

        const usageMap: Record<string, number> = {}
        for (const tx of txns || []) {
          usageMap[tx.item_id] = (usageMap[tx.item_id] || 0) + tx.quantity
        }

        const results = (items || [])
          .filter((item) => {
            return !site_name || (item.sites as any)?.name?.toLowerCase().includes(site_name.toLowerCase())
          })
          .map((item) => {
            const totalUsed = usageMap[item.id] || 0
            const avgDaily = totalUsed / days_back
            const daysLeft = avgDaily > 0 ? Math.floor(item.current_stock / avgDaily) : null

            let level: string
            if (avgDaily === 0) {
              level = item.current_stock <= item.minimum_stock ? "high" : "low"
            } else if (daysLeft !== null && daysLeft <= 7) {
              level = "critical"
            } else if (daysLeft !== null && daysLeft <= 14) {
              level = "high"
            } else if (daysLeft !== null && daysLeft <= 30) {
              level = "medium"
            } else {
              level = "low"
            }

            if (item.current_stock <= item.minimum_stock && (level === "low" || level === "medium")) {
              level = "high"
            }

            return {
              name: item.name,
              code: item.code,
              unit: item.unit,
              current_stock: item.current_stock,
              minimum_stock: item.minimum_stock,
              site: (item.sites as any)?.name,
              category: (item.categories as any)?.name,
              avg_daily_consumption: Math.round(avgDaily * 100) / 100,
              days_remaining: daysLeft,
              risk_level: level,
            }
          })
          .filter((item) => risk_level === "all" || item.risk_level === risk_level)
          .sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 }
            return (order[a.risk_level as keyof typeof order] ?? 4) - (order[b.risk_level as keyof typeof order] ?? 4)
          })

        const summary = {
          critical: results.filter((r) => r.risk_level === "critical").length,
          high: results.filter((r) => r.risk_level === "high").length,
          medium: results.filter((r) => r.risk_level === "medium").length,
          low: results.filter((r) => r.risk_level === "low").length,
        }

        return { summary, items: results.slice(0, 20), days_analysed: days_back }
      },
    }),

    get_delayed_purchase_orders: tool({
      description:
        "Find purchase orders that are delayed — sent or partially received but past their expected delivery date. " +
        "Use for questions about delayed or overdue POs, delivery problems, or supplier delays.",
      inputSchema: z.object({
        supplier_name: z
          .string()
          .optional()
          .describe("Filter by supplier name."),
      }),
      execute: async ({ supplier_name }: { supplier_name?: string }) => {
        const today = new Date().toISOString().split("T")[0]

        const { data, error } = await supabase
          .from("purchase_orders")
          .select("po_number, status, order_date, expected_delivery_date, total_amount, suppliers(name), sites(name)")
          .in("status", ["sent", "partially_received"])
          .lt("expected_delivery_date", today)
          .order("expected_delivery_date", { ascending: true })

        if (error) return { error: error.message }

        const filtered = (data || []).filter((po) => {
          return !supplier_name || (po.suppliers as any)?.name?.toLowerCase().includes(supplier_name.toLowerCase())
        })

        return {
          count: filtered.length,
          purchase_orders: filtered.map((po) => ({
            po_number: po.po_number,
            status: po.status,
            supplier: (po.suppliers as any)?.name,
            site: (po.sites as any)?.name,
            order_date: po.order_date,
            expected_delivery_date: po.expected_delivery_date,
            days_overdue: Math.floor(
              (new Date().getTime() - new Date(po.expected_delivery_date).getTime()) / (1000 * 60 * 60 * 24)
            ),
            total_amount: po.total_amount,
          })),
        }
      },
    }),

    get_supplier_invoice_summary: tool({
      description:
        "Summarise invoices grouped by supplier, including overdue counts and outstanding amounts. " +
        "Use for questions about which supplier has the most overdue invoices, payment obligations, or financial exposure per vendor.",
      inputSchema: z.object({
        status: z
          .enum(["overdue", "pending", "partially_paid", "all"])
          .optional()
          .describe("Filter by invoice status. Defaults to 'all'."),
      }),
      execute: async ({ status = "all" }: { status?: "overdue" | "pending" | "partially_paid" | "all" }) => {
        const { data, error } = await supabase
          .from("invoices")
          .select("supplier_id, status, due_date, total_amount, amount_paid, suppliers(name)")
          .not("status", "in", '("paid","cancelled")')

        if (error) return { error: error.message }

        const today = new Date()
        const grouped: Record<
          string,
          { supplier: string; total: number; overdue: number; pending: number; outstanding: number }
        > = {}

        for (const inv of data || []) {
          const supplierName = (inv.suppliers as any)?.name || "Unknown"
          if (!grouped[supplierName]) {
            grouped[supplierName] = { supplier: supplierName, total: 0, overdue: 0, pending: 0, outstanding: 0 }
          }
          grouped[supplierName].total++
          grouped[supplierName].outstanding += inv.total_amount - inv.amount_paid

          const isOverdue =
            inv.status !== "paid" &&
            inv.status !== "cancelled" &&
            new Date(inv.due_date) < today

          if (isOverdue) grouped[supplierName].overdue++
          else grouped[supplierName].pending++
        }

        let rows = Object.values(grouped).sort((a, b) => b.overdue - a.overdue)

        if (status === "overdue") rows = rows.filter((r) => r.overdue > 0)
        if (status === "pending") rows = rows.filter((r) => r.pending > 0)

        return {
          suppliers: rows.map((r) => ({
            ...r,
            outstanding: Math.round(r.outstanding * 100) / 100,
          })),
          total_outstanding: Math.round(rows.reduce((s, r) => s + r.outstanding, 0) * 100) / 100,
        }
      },
    }),

    get_overdue_invoices: tool({
      description:
        "Get all invoices that are past their due date and not fully paid. " +
        "Use for questions about outstanding payments, overdue bills, or financial liabilities.",
      inputSchema: z.object({
        supplier_name: z
          .string()
          .optional()
          .describe("Filter by supplier name."),
      }),
      execute: async ({ supplier_name }: { supplier_name?: string }) => {
        const today = new Date().toISOString().split("T")[0]

        const { data, error } = await supabase
          .from("invoices")
          .select("invoice_number, status, due_date, total_amount, amount_paid, suppliers(name), sites(name)")
          .not("status", "in", '("paid","cancelled")')
          .lt("due_date", today)
          .order("due_date", { ascending: true })

        if (error) return { error: error.message }

        const filtered = (data || []).filter((inv) => {
          return !supplier_name || (inv.suppliers as any)?.name?.toLowerCase().includes(supplier_name.toLowerCase())
        })

        return {
          count: filtered.length,
          total_outstanding: Math.round(
            filtered.reduce((s, inv) => s + (inv.total_amount - inv.amount_paid), 0) * 100
          ) / 100,
          invoices: filtered.map((inv) => ({
            invoice_number: inv.invoice_number,
            supplier: (inv.suppliers as any)?.name,
            site: (inv.sites as any)?.name,
            due_date: inv.due_date,
            days_overdue: Math.floor(
              (new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
            ),
            total_amount: inv.total_amount,
            amount_paid: inv.amount_paid,
            outstanding: Math.round((inv.total_amount - inv.amount_paid) * 100) / 100,
          })),
        }
      },
    }),

    get_pending_purchase_orders: tool({
      description:
        "Get purchase orders that are in draft or sent status (not yet fully received). " +
        "Use for questions about pending deliveries, unconfirmed orders, or what's been ordered.",
      inputSchema: z.object({
        supplier_name: z
          .string()
          .optional()
          .describe("Filter by supplier name."),
        status: z
          .enum(["draft", "sent", "partially_received", "all"])
          .optional()
          .describe("Filter by PO status. Defaults to 'all' pending statuses."),
      }),
      execute: async ({
        supplier_name,
        status = "all",
      }: {
        supplier_name?: string
        status?: "draft" | "sent" | "partially_received" | "all"
      }) => {
        const statuses =
          status === "all" ? ["draft", "sent", "partially_received"] : [status]

        const { data, error } = await supabase
          .from("purchase_orders")
          .select("po_number, status, order_date, expected_delivery_date, total_amount, suppliers(name), sites(name)")
          .in("status", statuses)
          .order("order_date", { ascending: false })

        if (error) return { error: error.message }

        const filtered = (data || []).filter((po) => {
          return !supplier_name || (po.suppliers as any)?.name?.toLowerCase().includes(supplier_name.toLowerCase())
        })

        return {
          count: filtered.length,
          total_value: Math.round(filtered.reduce((s, po) => s + po.total_amount, 0) * 100) / 100,
          purchase_orders: filtered.map((po) => ({
            po_number: po.po_number,
            status: po.status,
            supplier: (po.suppliers as any)?.name,
            site: (po.sites as any)?.name,
            order_date: po.order_date,
            expected_delivery_date: po.expected_delivery_date,
            total_amount: po.total_amount,
          })),
        }
      },
    }),

    get_daily_priorities: tool({
      description:
        "Get a combined list of the most urgent action items for today: critically low stock, " +
        "POs expected to arrive today, and invoices due today or already overdue. " +
        "Use when asked what to prioritise, what needs attention today, or for a morning briefing.",
      inputSchema: z.object({}),
      execute: async () => {
        const today = new Date().toISOString().split("T")[0]
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const weekAgo = sevenDaysAgo.toISOString().split("T")[0]

        const [
          { data: criticalItems },
          { data: todayDeliveries },
          { data: urgentInvoices },
          { data: recentTxns },
        ] = await Promise.all([
          supabase
            .from("inventory_items")
            .select("name, code, unit, current_stock, minimum_stock, sites(name)")
            .eq("is_active", true)
            .filter("current_stock", "lte", "minimum_stock"),
          supabase
            .from("purchase_orders")
            .select("po_number, status, expected_delivery_date, suppliers(name), sites(name)")
            .in("status", ["sent", "partially_received"])
            .eq("expected_delivery_date", today),
          supabase
            .from("invoices")
            .select("invoice_number, due_date, total_amount, amount_paid, suppliers(name)")
            .not("status", "in", '("paid","cancelled")')
            .lte("due_date", today)
            .order("due_date"),
          supabase
            .from("inventory_transactions")
            .select("transaction_number, type, quantity, transaction_date, inventory_items(name, unit)")
            .gte("transaction_date", weekAgo)
            .order("transaction_date", { ascending: false })
            .limit(5),
        ])

        return {
          critical_low_stock: (criticalItems || []).map((i) => ({
            name: i.name,
            code: i.code,
            current: `${i.current_stock} ${i.unit}`,
            minimum: `${i.minimum_stock} ${i.unit}`,
            site: (i.sites as any)?.name,
          })),
          deliveries_expected_today: (todayDeliveries || []).map((po) => ({
            po_number: po.po_number,
            supplier: (po.suppliers as any)?.name,
            site: (po.sites as any)?.name,
          })),
          urgent_invoices: (urgentInvoices || []).map((inv) => ({
            invoice_number: inv.invoice_number,
            supplier: (inv.suppliers as any)?.name,
            due_date: inv.due_date,
            outstanding: Math.round((inv.total_amount - inv.amount_paid) * 100) / 100,
          })),
          recent_transactions: (recentTxns || []).map((tx) => ({
            number: tx.transaction_number,
            type: tx.type,
            item: (tx.inventory_items as any)?.name,
            quantity: `${tx.quantity} ${(tx.inventory_items as any)?.unit || ""}`,
            date: tx.transaction_date,
          })),
        }
      },
    }),

    get_inventory_overview: tool({
      description:
        "Get a high-level summary of the entire inventory: total items, total value, breakdown by category, " +
        "and counts of low/out-of-stock items. Use for general stock health questions.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data: items, error } = await supabase
          .from("inventory_items")
          .select("current_stock, minimum_stock, unit_price, categories(name), sites(name)")
          .eq("is_active", true)

        if (error) return { error: error.message }

        const all = items || []
        const totalValue = all.reduce((s, i) => s + i.current_stock * i.unit_price, 0)
        const lowStock = all.filter((i) => i.current_stock > 0 && i.current_stock <= i.minimum_stock).length
        const outOfStock = all.filter((i) => i.current_stock === 0).length

        const byCategory: Record<string, { count: number; value: number }> = {}
        for (const item of all) {
          const cat = (item.categories as any)?.name || "Uncategorized"
          if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 }
          byCategory[cat].count++
          byCategory[cat].value += item.current_stock * item.unit_price
        }

        const bySite: Record<string, number> = {}
        for (const item of all) {
          const site = (item.sites as any)?.name || "Unassigned"
          bySite[site] = (bySite[site] || 0) + 1
        }

        return {
          total_items: all.length,
          low_stock_items: lowStock,
          out_of_stock_items: outOfStock,
          total_inventory_value: Math.round(totalValue * 100) / 100,
          by_category: Object.entries(byCategory)
            .map(([name, d]) => ({ category: name, items: d.count, value: Math.round(d.value) }))
            .sort((a, b) => b.value - a.value),
          by_site: Object.entries(bySite).map(([site, count]) => ({ site, items: count })),
        }
      },
    }),

    get_recent_transactions: tool({
      description:
        "Get the most recent inventory transactions (inward receipts or outward issues). " +
        "Use for questions about recent activity, what was issued or received, or movement history.",
      inputSchema: z.object({
        limit: z
          .number()
          .optional()
          .describe("Number of transactions to return. Defaults to 10, max 25."),
        type: z
          .enum(["inward", "outward", "all"])
          .optional()
          .describe("Filter by transaction type. Defaults to 'all'."),
        item_name: z
          .string()
          .optional()
          .describe("Filter by material name (partial match)."),
      }),
      execute: async ({
        limit = 10,
        type = "all",
        item_name,
      }: {
        limit?: number
        type?: "inward" | "outward" | "all"
        item_name?: string
      }) => {
        const clampedLimit = Math.min(limit, 25)
        let query = supabase
          .from("inventory_transactions")
          .select(
            "transaction_number, type, quantity, unit_price, transaction_date, purpose, issued_to, inventory_items(name, code, unit), sites(name)"
          )
          .order("transaction_date", { ascending: false })
          .limit(clampedLimit * 3) // over-fetch to allow filtering

        if (type !== "all") query = query.eq("type", type)

        const { data, error } = await query
        if (error) return { error: error.message }

        let filtered = data || []
        if (item_name) {
          filtered = filtered.filter((tx) =>
            (tx.inventory_items as any)?.name?.toLowerCase().includes(item_name.toLowerCase())
          )
        }

        return {
          transactions: filtered.slice(0, clampedLimit).map((tx) => ({
            number: tx.transaction_number,
            type: tx.type,
            item: (tx.inventory_items as any)?.name,
            item_code: (tx.inventory_items as any)?.code,
            quantity: `${tx.quantity} ${(tx.inventory_items as any)?.unit || ""}`,
            date: tx.transaction_date,
            purpose: tx.purpose,
            issued_to: tx.issued_to,
            site: (tx.sites as any)?.name,
          })),
        }
      },
    }),

    get_item_details: tool({
      description:
        "Get detailed information about a specific inventory item by name. " +
        "Use when asked about a particular material's stock level, price, location, or specs.",
      inputSchema: z.object({
        item_name: z
          .string()
          .describe("Name of the material to look up (partial match supported)."),
      }),
      execute: async ({ item_name }: { item_name: string }) => {
        const { data, error } = await supabase
          .from("inventory_items")
          .select("*, categories(name), sites(name), storage_locations(name)")
          .eq("is_active", true)
          .ilike("name", `%${item_name}%`)
          .limit(5)

        if (error) return { error: error.message }

        return {
          matches: (data || []).map((item) => ({
            name: item.name,
            code: item.code,
            unit: item.unit,
            category: (item.categories as any)?.name,
            site: (item.sites as any)?.name,
            storage_location: (item.storage_locations as any)?.name,
            current_stock: item.current_stock,
            minimum_stock: item.minimum_stock,
            reorder_quantity: item.reorder_quantity,
            unit_price: item.unit_price,
            total_value: Math.round(item.current_stock * item.unit_price * 100) / 100,
            description: item.description,
          })),
        }
      },
    }),
  }
}
