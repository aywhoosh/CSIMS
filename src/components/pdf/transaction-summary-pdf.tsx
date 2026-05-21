import { Document, Page, View, Text } from "@react-pdf/renderer"
import { PdfHeader } from "./shared/pdf-header"
import { PdfFooter } from "./shared/pdf-footer"
import { pdfStyles, LIGHT_BG, BORDER_COLOR } from "./shared/pdf-styles"

interface Transaction {
  transaction_number: string
  type: "inward" | "outward"
  quantity: number
  unit_price: number
  transaction_date: string
  purpose?: string
  issued_to?: string
  challan_number?: string
  inventory_items: { name: string; code: string; unit: string } | null
  sites: { name: string } | null
  profiles: { full_name: string } | null
}

interface TransactionSummaryPdfProps {
  transactions: Transaction[]
  dateFrom: string
  dateTo: string
  siteName?: string
  generatedBy?: string
}

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

export function TransactionSummaryPdf({
  transactions,
  dateFrom,
  dateTo,
  siteName,
  generatedBy,
}: TransactionSummaryPdfProps) {
  const inward = transactions.filter((t) => t.type === "inward")
  const outward = transactions.filter((t) => t.type === "outward")
  const inwardValue = inward.reduce((s, t) => s + t.quantity * t.unit_price, 0)
  const outwardValue = outward.reduce((s, t) => s + t.quantity * t.unit_price, 0)

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} orientation="landscape">
        <PdfHeader
          reportType="Transaction Summary"
          title={`Transaction Summary — ${fmtDate(dateFrom)} to ${fmtDate(dateTo)}`}
          generatedBy={generatedBy}
          meta={{
            Period: `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`,
            Site: siteName ?? "All Sites",
            "Total Transactions": transactions.length.toString(),
            "Inward Transactions": `${inward.length} (${fmt(inwardValue)})`,
            "Outward Transactions": `${outward.length} (${fmt(outwardValue)})`,
          }}
        />

        {/* Inward */}
        {inward.length > 0 && (
          <>
            <Text style={[pdfStyles.sectionTitle, { color: "#15803d" }]}>
              Inward Receipts ({inward.length})
            </Text>
            <TransactionTable transactions={inward} />
          </>
        )}

        {/* Outward */}
        {outward.length > 0 && (
          <>
            <Text style={[pdfStyles.sectionTitle, { color: "#c2410c", marginTop: 16 }]}>
              Outward Issues ({outward.length})
            </Text>
            <TransactionTable transactions={outward} />
          </>
        )}

        {transactions.length === 0 && (
          <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 16 }}>
            No transactions recorded in this period.
          </Text>
        )}

        <PdfFooter />
      </Page>
    </Document>
  )
}

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const fmt = (n: number) =>
    "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fmtDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—"

  return (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.tableHead}>
        <Text style={[pdfStyles.tableHeadCell, { flex: 1.5 }]}>Txn #</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 1 }]}>Date</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 2.5 }]}>Material</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 0.8, textAlign: "right" }]}>Qty</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 0.5 }]}>Unit</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Unit Price</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 1.2, textAlign: "right" }]}>Value</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 1.5 }]}>Purpose / Issued To</Text>
        <Text style={[pdfStyles.tableHeadCell, { flex: 1.2 }]}>Performed By</Text>
      </View>

      {transactions.map((tx, i) => {
        const mat = tx.inventory_items
        return (
          <View
            key={i}
            style={[pdfStyles.tableRow, i % 2 === 1 ? { backgroundColor: LIGHT_BG } : {}]}
          >
            <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{tx.transaction_number}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{fmtDate(tx.transaction_date)}</Text>
            <View style={{ flex: 2.5 }}>
              <Text style={pdfStyles.tableCell}>{mat?.name ?? "—"}</Text>
              <Text style={pdfStyles.tableCellMuted}>{mat?.code}</Text>
            </View>
            <Text style={[pdfStyles.tableCell, { flex: 0.8, textAlign: "right" }]}>{tx.quantity}</Text>
            <Text style={[pdfStyles.tableCellMuted, { flex: 0.5 }]}>{mat?.unit}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "right" }]}>
              {fmt(tx.unit_price)}
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.bold, { flex: 1.2, textAlign: "right" }]}>
              {fmt(tx.quantity * tx.unit_price)}
            </Text>
            <Text style={[pdfStyles.tableCellMuted, { flex: 1.5 }]}>
              {tx.purpose ?? tx.issued_to ?? "—"}
            </Text>
            <Text style={[pdfStyles.tableCellMuted, { flex: 1.2 }]}>
              {(tx.profiles as any)?.full_name ?? "—"}
            </Text>
          </View>
        )
      })}

      {/* Total row */}
      <View style={pdfStyles.totalsRow}>
        <Text style={[pdfStyles.totalsLabel, { flex: 8 }]}>
          Total ({transactions.length} transactions)
        </Text>
        <Text style={[pdfStyles.totalsValue, { flex: 1.2, textAlign: "right" }]}>
          {"₹" +
            transactions
              .reduce((s, t) => s + t.quantity * t.unit_price, 0)
              .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={{ flex: 2.4 }} />
      </View>
    </View>
  )
}
