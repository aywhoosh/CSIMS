"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/actions/auth"
import { clearTransactionData, clearAllData } from "@/lib/actions/admin"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  Menu,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  ClipboardList,
  FileText,
  Bell,
  ClipboardCheck,
  Settings,
  ShieldAlert,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Eraser,
  Trash2,
  Database,
} from "lucide-react"
import { getInitials, cn } from "@/lib/utils"
import { toast } from "sonner"
import { SeedProgressModal } from "@/components/admin/seed-progress-modal"

type AdminAction = "clear-txn" | "clear-all" | "seed" | null

const ADMIN_ACTION_CONFIG = {
  "clear-txn": {
    title: "Clear Transaction Data?",
    description:
      "This will permanently delete all transactions, purchase orders, invoices, payments, and stock audits. Stock levels will be reset to 0. This cannot be undone.",
    confirmLabel: "Clear Transactions",
    destructive: true,
  },
  "clear-all": {
    title: "Clear ALL Data?",
    description:
      "This will permanently delete ALL data including materials, suppliers, categories, and all transactional records. Only user profiles are preserved. This cannot be undone.",
    confirmLabel: "Delete Everything",
    destructive: true,
  },
  seed: {
    title: "Seed Demo Data?",
    description:
      "This will insert sample demo data into the database. Existing records with the same IDs will be skipped. For a clean seed, clear all data first.",
    confirmLabel: "Seed Data",
    destructive: false,
  },
} as const

interface TopBarProps {
  userName: string
  userRole: string
  onMenuClick: () => void
}

export function TopBar({ userName, userRole, onMenuClick }: TopBarProps) {
  const router = useRouter()
  const [adminAction, setAdminAction] = useState<AdminAction>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showSeedProgress, setShowSeedProgress] = useState(false)

  const roleLabel =
    userRole === "admin"
      ? "Administrator"
      : userRole === "site_manager"
        ? "Site Manager"
        : "Store Keeper"

  const isAdmin = userRole === "admin"
  const isAdminOrManager = userRole === "admin" || userRole === "site_manager"

  async function handleAdminConfirm() {
    if (!adminAction) return

    // Seed action uses the progress modal instead of running inline
    if (adminAction === "seed") {
      setAdminAction(null)
      setShowSeedProgress(true)
      return
    }

    setIsRunning(true)
    try {
      const result =
        adminAction === "clear-txn"
          ? await clearTransactionData()
          : await clearAllData()

      if (result?.error) {
        toast.error(result.error)
      } else {
        const messages = {
          "clear-txn": "Transaction data cleared",
          "clear-all": "All data cleared",
        }
        toast.success(messages[adminAction])
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsRunning(false)
      setAdminAction(null)
    }
  }

  const actionConfig = adminAction ? ADMIN_ACTION_CONFIG[adminAction] : null

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Blessing Homz Pvt Ltd
            </h2>
            <p className="text-xs text-muted-foreground">
              Construction Site Inventory Management
            </p>
          </div>
        </div>

        {/* Right side: User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
              "transition-colors hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{userName}</p>
              <p className="text-xs text-muted-foreground leading-tight">{roleLabel}</p>
            </div>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            {/* User identity header */}
            <div className="px-2 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{userName}</p>
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
                      isAdmin
                        ? "bg-primary/15 text-primary"
                        : isAdminOrManager
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Quick Navigation — Inventory */}
            <DropdownMenuLabel>Inventory</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/inventory" className="cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                Materials
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions/inward/new" className="cursor-pointer">
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Record Inward
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions/outward/new" className="cursor-pointer">
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                Record Outward
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions" className="cursor-pointer">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Transactions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/alerts" className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                Alerts
              </Link>
            </DropdownMenuItem>

            {/* Procurement — admin/manager only */}
            {isAdminOrManager && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Procurement</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/suppliers" className="cursor-pointer">
                    <Truck className="mr-2 h-4 w-4" />
                    Suppliers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/purchase-orders" className="cursor-pointer">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Purchase Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/invoices" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoices
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/audits" className="cursor-pointer">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Stock Audits
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            {/* Account */}
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            )}

            {/* Admin Quick Actions — 3 circular buttons */}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <div className="flex items-center justify-center gap-3 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setAdminAction("clear-txn")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                    title="Clear Transactions"
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAction("clear-all")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                    title="Clear All Data"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAction("seed")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/30 text-blue-500 transition-colors hover:bg-blue-500/10"
                    title="Seed Demo Data"
                  >
                    <Database className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut()}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Admin Action Confirmation Dialog */}
      {actionConfig && (
        <AlertDialog
          open={adminAction !== null}
          onOpenChange={(open) => {
            if (!open && !isRunning) setAdminAction(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{actionConfig.title}</AlertDialogTitle>
              <AlertDialogDescription>{actionConfig.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAdminConfirm}
                disabled={isRunning}
                className={
                  actionConfig.destructive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }
              >
                {isRunning ? "Processing..." : actionConfig.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Seed Progress Modal */}
      <SeedProgressModal
        open={showSeedProgress}
        onOpenChange={setShowSeedProgress}
        onComplete={() => router.refresh()}
      />
    </>
  )
}
