"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { InventoryTransaction } from "@/lib/types"

export const columns: ColumnDef<InventoryTransaction>[] = [
  {
    accessorKey: "transaction_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Txn #" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("transaction_number")}</span>
    ),
  },
  {
    id: "item",
    accessorFn: (row) => (row.inventory_items as any)?.name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{(row.original.inventory_items as any)?.name}</div>
        <div className="text-xs text-muted-foreground font-mono">
          {(row.original.inventory_items as any)?.code}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "inward" ? "default" : "secondary"}>
          {type === "inward" ? "Inward" : "Outward"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Quantity" />,
    cell: ({ row }) => {
      const item = row.original
      return (
        <span>
          {item.quantity} {(item.inventory_items as any)?.unit}
        </span>
      )
    },
  },
  {
    accessorKey: "rejected_quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rejected" />,
    cell: ({ row }) => {
      const qty = row.getValue("rejected_quantity") as number
      return qty > 0 ? (
        <span className="text-destructive">{qty}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: "performed_by",
    accessorFn: (row) => (row.profiles as any)?.full_name || "-",
    header: ({ column }) => <DataTableColumnHeader column={column} title="By" />,
  },
  {
    accessorKey: "transaction_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => formatDate(row.getValue("transaction_date")),
  },
]
