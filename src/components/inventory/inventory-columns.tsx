"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, getStockStatus } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Pencil } from "lucide-react"
import Link from "next/link"
import type { InventoryItem } from "@/lib/types"

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("code")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    id: "category",
    accessorFn: (row) => (row.categories as any)?.name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
  },
  {
    id: "site",
    accessorFn: (row) => (row.sites as any)?.name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Site" />,
  },
  {
    accessorKey: "current_stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const item = row.original
      const status = getStockStatus(item.current_stock, item.minimum_stock)
      return (
        <div className="flex items-center gap-2">
          <span>{item.current_stock} {item.unit}</span>
          <StatusBadge status={status} />
        </div>
      )
    },
  },
  {
    accessorKey: "unit_price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Unit Price" />,
    cell: ({ row }) => formatCurrency(row.getValue("unit_price")),
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
            <Link href={`/inventory/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/inventory/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
