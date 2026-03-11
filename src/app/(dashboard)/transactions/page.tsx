import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTransactions } from "@/lib/queries/transactions"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { columns } from "@/components/transactions/transaction-columns"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

export default async function TransactionsPage() {
  const supabase = await createServerSupabaseClient()
  const transactions = await getTransactions(supabase)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track material inward and outward movements</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/transactions/inward/new">
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Record Inward
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/transactions/outward/new">
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Record Outward
            </Link>
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="transaction_number"
        searchPlaceholder="Search transactions..."
      />
    </div>
  )
}
