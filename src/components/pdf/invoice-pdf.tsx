import { Document, Page, View, Text } from "@react-pdf/renderer"
import { PdfHeader } from "./shared/pdf-header"
import { PdfFooter } from "./shared/pdf-footer"
import { pdfStyles, getStatusColors, BORDER_COLOR, LIGHT_BG, BRAND_GREEN } from "./shared/pdf-styles"

interface Payment {
  payment_number: string
  amount: number
  payment_date: string
  payment_method: string
  reference_number?: string
  profiles?: { full_name: string } | null
}

interface InvoicePdfProps {
  invoice: {
    invoice_number: string
    status: string
    invoice_date: string
    due_date: string
    subtotal: number
    tax_amount: number
    total_amount: number
    amount_paid: number
    purchase_orders: { po_number: string } | null
    suppliers: { name: string; phone?: string; email?: string } | null
    sites: { name: string } | null
    payments?: Payment[]
  }
  generatedBy?: string
}

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

export function InvoicePdf({ invoice, generatedBy }: InvoicePdfProps) {
  const outstanding = invoice.total_amount - invoice.amount_paid
  const payments = invoice.payments ?? []

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          reportType="Invoice"
          title={`Invoice — ${invoice.invoice_number}`}
          generatedBy={generatedBy}
          meta={{
            "Invoice Number": invoice.invoice_number,
            Status: invoice.status.replace(/_/g, " ").toUpperCase(),
            "Invoice Date": fmtDate(invoice.invoice_date),
            "Due Date": fmtDate(invoice.due_date),
            Supplier: (invoice.suppliers as any)?.name ?? "—",
            "Supplier Phone": (invoice.suppliers as any)?.phone ?? "—",
            "Supplier Email": (invoice.suppliers as any)?.email ?? "—",
            "Linked PO": (invoice.purchase_orders as any)?.po_number ?? "—",
            Site: (invoice.sites as any)?.name ?? "—",
          }}
        />

        {/* Amounts Summary */}
        <Text style={pdfStyles.sectionTitle}>Amount Summary</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            { label: "Subtotal", value: fmt(invoice.subtotal) },
            { label: "Tax", value: fmt(invoice.tax_amount) },
            { label: "Total Amount", value: fmt(invoice.total_amount), accent: true },
            { label: "Amount Paid", value: fmt(invoice.amount_paid) },
            { label: "Outstanding", value: fmt(outstanding), warning: outstanding > 0 },
          ].map(({ label, value, accent, warning }) => (
            <View
              key={label}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: accent ? BRAND_GREEN : warning ? "#fca5a5" : BORDER_COLOR,
                backgroundColor: accent ? "#f0fdf4" : warning && outstanding > 0 ? "#fef2f2" : LIGHT_BG,
              }}
            >
              <Text
                style={[
                  pdfStyles.infoLabel,
                  accent ? { color: BRAND_GREEN } : warning && outstanding > 0 ? { color: "#b91c1c" } : {},
                ]}
              >
                {label}
              </Text>
              <Text
                style={[
                  pdfStyles.infoValue,
                  { fontSize: 10 },
                  accent ? { color: BRAND_GREEN } : warning && outstanding > 0 ? { color: "#b91c1c" } : {},
                ]}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Payments table */}
        <Text style={pdfStyles.sectionTitle}>Payment History</Text>
        {payments.length === 0 ? (
          <Text style={{ fontSize: 8.5, color: "#6b7280", marginBottom: 8 }}>
            No payments recorded yet.
          </Text>
        ) : (
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHead}>
              <Text style={[pdfStyles.tableHeadCell, { flex: 1.5 }]}>Payment #</Text>
              <Text style={[pdfStyles.tableHeadCell, { flex: 1 }]}>Date</Text>
              <Text style={[pdfStyles.tableHeadCell, { flex: 1 }]}>Method</Text>
              <Text style={[pdfStyles.tableHeadCell, { flex: 1.5 }]}>Reference</Text>
              <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Amount</Text>
              <Text style={[pdfStyles.tableHeadCell, { flex: 1.5 }]}>Recorded By</Text>
            </View>
            {payments.map((p, i) => (
              <View
                key={i}
                style={[pdfStyles.tableRow, i % 2 === 1 ? { backgroundColor: LIGHT_BG } : {}]}
              >
                <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{p.payment_number}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{fmtDate(p.payment_date)}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1 }]}>
                  {p.payment_method.replace(/_/g, " ")}
                </Text>
                <Text style={[pdfStyles.tableCellMuted, { flex: 1.5 }]}>{p.reference_number ?? "—"}</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.bold, { flex: 1, textAlign: "right" }]}>
                  {fmt(p.amount)}
                </Text>
                <Text style={[pdfStyles.tableCellMuted, { flex: 1.5 }]}>
                  {(p.profiles as any)?.full_name ?? "—"}
                </Text>
              </View>
            ))}
            <View style={pdfStyles.totalsRow}>
              <Text style={[pdfStyles.totalsLabel, { flex: 5.5 }]}>Total Paid</Text>
              <Text style={[pdfStyles.totalsValue, { flex: 1, textAlign: "right" }]}>
                {fmt(invoice.amount_paid)}
              </Text>
              <View style={{ flex: 1.5 }} />
            </View>
          </View>
        )}

        <PdfFooter />
      </Page>
    </Document>
  )
}
