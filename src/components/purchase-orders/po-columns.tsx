"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"
import type { PurchaseOrder } from "@/lib/types"

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "po_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="PO #" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("po_number")}</span>
    ),
  },
  {
    id: "supplier",
    accessorFn: (row) => (row.suppliers as any)?.name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
    cell: ({ row }) => (
      <div className="font-medium">{(row.original.suppliers as any)?.name}</div>
    ),
  },
  {
    id: "site",
    accessorFn: (row) => (row.sites as any)?.name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Site" />,
  },
  {
    accessorKey: "order_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" />,
    cell: ({ row }) => formatDate(row.getValue("order_date")),
  },
  {
    accessorKey: "expected_delivery_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Expected" />,
    cell: ({ row }) => {
      const date = row.getValue("expected_delivery_date") as string | null
      return date ? formatDate(date) : "-"
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <span className="font-semibold">{formatCurrency(row.getValue("total_amount"))}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/purchase-orders/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
