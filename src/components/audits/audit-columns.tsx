"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"
import type { StockAudit } from "@/lib/types"

export const columns: ColumnDef<StockAudit>[] = [
  {
    accessorKey: "audit_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audit #" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("audit_number")}</span>
    ),
  },
  {
    id: "site",
    accessorFn: (row) => (row.sites as any)?.name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Site" />,
  },
  {
    accessorKey: "audit_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => formatDate(row.getValue("audit_date")),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "conducted_by",
    accessorFn: (row) => (row as any).conducted_by?.full_name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Conducted By" />,
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
            <Link href={`/audits/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
