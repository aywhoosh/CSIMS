import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Truck,
  ClipboardList,
  FileText,
  Bell,
  ClipboardCheck,
  Settings,
  ShieldAlert,
  TrendingUp,
} from "lucide-react"

export type UserRole = "admin" | "site_manager" | "store_keeper"

export const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
    ],
  },
  {
    group: "Inventory",
    items: [
      { label: "Materials", href: "/inventory", icon: Package, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
      { label: "Inward", href: "/transactions/inward/new", icon: ArrowDownToLine, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
      { label: "Outward", href: "/transactions/outward/new", icon: ArrowUpFromLine, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
      { label: "Transactions", href: "/transactions", icon: ArrowLeftRight, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
    ],
  },
  {
    group: "Procurement",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: Truck, roles: ["admin", "site_manager"] as UserRole[] },
      { label: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList, roles: ["admin", "site_manager"] as UserRole[] },
    ],
  },
  {
    group: "Finance",
    items: [
      { label: "Invoices", href: "/invoices", icon: FileText, roles: ["admin", "site_manager"] as UserRole[] },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Alerts", href: "/alerts", icon: Bell, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
      { label: "Insights", href: "/insights", icon: TrendingUp, roles: ["admin", "site_manager", "store_keeper"] as UserRole[] },
      { label: "Stock Audit", href: "/audits", icon: ClipboardCheck, roles: ["admin", "site_manager"] as UserRole[] },
      { label: "Admin Panel", href: "/admin", icon: ShieldAlert, roles: ["admin"] as UserRole[] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["admin"] as UserRole[] },
    ],
  },
]

export const UNITS = [
  "kg",
  "bags",
  "pcs",
  "cu.m",
  "litres",
  "metres",
  "sq.m",
  "tonnes",
  "bundles",
  "pairs",
  "sets",
  "boxes",
  "rolls",
] as const

export const MATERIAL_CATEGORIES = [
  "Cement",
  "Steel/Rebar",
  "Bricks/Blocks",
  "Sand/Aggregate",
  "Timber/Plywood",
  "Pipes/Fittings",
  "Electrical",
  "Paint/Finish",
  "Hardware/Fasteners",
  "Safety Equipment",
  "Tools",
  "Tiles/Flooring",
] as const

export const PO_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Partially Received", value: "partially_received" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
] as const

export const INVOICE_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
] as const

export const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Cheque", value: "cheque" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "UPI", value: "upi" },
  { label: "Other", value: "other" },
] as const

export const CHART_COLORS = {
  primary: "#8CB82B",
  secondary: "#58585A",
  tertiary: "#3B82F6",
  quaternary: "#F59E0B",
  danger: "#EF4444",
  success: "#22C55E",
  muted: "#94A3B8",
} as const

export const CHART_COLOR_ARRAY = [
  "#8CB82B",
  "#58585A",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#22C55E",
  "#94A3B8",
] as const

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  sent: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  partially_received: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  received: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  partially_paid: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  reviewed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  inward: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  outward: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  low_stock: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  out_of_stock: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  in_stock: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
}
