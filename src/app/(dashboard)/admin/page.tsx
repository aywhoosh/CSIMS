"use client"

import { useEffect, useState } from "react"
import {
  Database,
  Trash2,
  AlertTriangle,
  Package,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  Truck,
  MapPin,
  ClipboardCheck,
  CreditCard,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getDatabaseStats, clearTransactionData, clearAllData } from "@/lib/actions/admin"
import { SeedProgressModal } from "@/components/admin/seed-progress-modal"

interface DatabaseStats {
  items: number
  transactions: number
  purchaseOrders: number
  invoices: number
  suppliers: number
  sites: number
  audits: number
  payments: number
}

const STAT_CARDS = [
  { key: "items" as const, label: "Inventory Items", icon: Package },
  { key: "transactions" as const, label: "Transactions", icon: ArrowLeftRight },
  { key: "purchaseOrders" as const, label: "Purchase Orders", icon: ClipboardList },
  { key: "invoices" as const, label: "Invoices", icon: FileText },
  { key: "suppliers" as const, label: "Suppliers", icon: Truck },
  { key: "sites" as const, label: "Sites", icon: MapPin },
  { key: "audits" as const, label: "Stock Audits", icon: ClipboardCheck },
  { key: "payments" as const, label: "Payments", icon: CreditCard },
]

export default function AdminPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [showSeedProgress, setShowSeedProgress] = useState(false)

  async function fetchStats() {
    try {
      const data = await getDatabaseStats()
      setStats(data)
    } catch {
      toast.error("Failed to load database statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  async function handleClearTransactions() {
    setClearing(true)
    try {
      await clearTransactionData()
      toast.success("Transaction data cleared successfully")
      await fetchStats()
    } catch (error: any) {
      toast.error(error?.message || "Failed to clear transaction data")
    } finally {
      setClearing(false)
    }
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      await clearAllData()
      toast.success("All data cleared successfully")
      await fetchStats()
    } catch (error: any) {
      toast.error(error?.message || "Failed to clear data")
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Control Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Database management and system administration
        </p>
      </div>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>Current record counts across all tables</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAT_CARDS.map((card) => (
                <div
                  key={card.key}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-semibold text-muted-foreground/50">--</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAT_CARDS.map((card) => (
                <div
                  key={card.key}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-semibold">
                      {stats?.[card.key] ?? 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible operations. Proceed with extreme caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Clear Transaction Data */}
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Clear Transaction Data</p>
              <p className="text-sm text-muted-foreground">
                Deletes all transactions, purchase orders, invoices, payments, and audits.
                Resets inventory stock quantities to 0. Materials and suppliers are kept.
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" disabled={clearing}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Transactions
                </Button>
              }
              title="Clear Transaction Data?"
              description="This will permanently delete all transactions, purchase orders, invoices, payments, and stock audits. All inventory stock levels will be reset to 0. This action cannot be undone."
              confirmLabel="Yes, clear transaction data"
              onConfirm={handleClearTransactions}
              destructive
            />
          </div>

          {/* Clear All Data */}
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Clear All Data</p>
              <p className="text-sm text-muted-foreground">
                Deletes everything: materials, suppliers, categories, transactions,
                purchase orders, invoices, payments, and audits. Only sites and user
                profiles are preserved.
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" disabled={clearing}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Clear All Data
                </Button>
              }
              title="Clear ALL Data?"
              description="This will permanently delete ALL data in the system including materials, suppliers, categories, and all transactional records. Only sites and user profiles will be kept. This action is irreversible."
              confirmLabel="Yes, delete everything"
              onConfirm={handleClearAll}
              destructive
            />
          </div>
        </CardContent>
      </Card>

      {/* Seed Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Seed Demo Data
          </CardTitle>
          <CardDescription>
            Populate the database with realistic sample data including categories, sites, suppliers, inventory items, transactions, purchase orders, invoices, payments, and stock audits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border border-blue-500/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Seed Database</p>
              <p className="text-sm text-muted-foreground">
                Inserts demo data using ON CONFLICT DO NOTHING. Safe to run on an existing database.
              </p>
            </div>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={clearing}
              onClick={() => setShowSeedProgress(true)}
            >
              <Database className="mr-2 h-4 w-4" />
              Seed Demo Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seed Progress Modal */}
      <SeedProgressModal
        open={showSeedProgress}
        onOpenChange={setShowSeedProgress}
        onComplete={() => fetchStats()}
      />
    </div>
  )
}
