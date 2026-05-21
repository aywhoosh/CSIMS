import { Document, Page, View, Text } from "@react-pdf/renderer"
import { PdfHeader } from "./shared/pdf-header"
import { PdfFooter } from "./shared/pdf-footer"
import { pdfStyles, getStatusColors, BORDER_COLOR, LIGHT_BG } from "./shared/pdf-styles"

interface POItem {
  inventory_items: { name: string; code: string; unit: string } | null
  quantity_ordered: number
  quantity_received: number
  unit_price: number
  tax_percent: number
  total_price: number
}

interface POPdfProps {
  po: {
    po_number: string
    status: string
    order_date: string
    expected_delivery_date?: string
    delivery_address?: string
    notes?: string
    subtotal: number
    tax_amount: number
    total_amount: number
    suppliers: { name: string; phone?: string; email?: string } | null
    sites: { name: string } | null
    purchase_order_items: POItem[]
    profiles?: { full_name: string } | null
  }
  generatedBy?: string
}

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

export function PoPdf({ po, generatedBy }: POPdfProps) {
  const statusColors = getStatusColors(po.status)

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          reportType="Purchase Order"
          title={`Purchase Order — ${po.po_number}`}
          generatedBy={generatedBy}
          meta={{
            "PO Number": po.po_number,
            Status: po.status.replace(/_/g, " ").toUpperCase(),
            "Order Date": fmtDate(po.order_date),
            "Expected Delivery": fmtDate(po.expected_delivery_date),
            Supplier: (po.suppliers as any)?.name ?? "—",
            "Supplier Phone": (po.suppliers as any)?.phone ?? "—",
            "Supplier Email": (po.suppliers as any)?.email ?? "—",
            Site: (po.sites as any)?.name ?? "—",
            "Delivery Address": po.delivery_address ?? "—",
          }}
        />

        {/* Line items table */}
        <Text style={pdfStyles.sectionTitle}>Order Items</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHead}>
            <Text style={[pdfStyles.tableHeadCell, { flex: 3 }]}>Material</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1.2 }]}>Code</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 0.8, textAlign: "right" }]}>Ordered</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 0.8, textAlign: "right" }]}>Received</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Unit Price</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 0.6, textAlign: "right" }]}>Tax%</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1.2, textAlign: "right" }]}>Total</Text>
          </View>

          {po.purchase_order_items.map((item, i) => {
            const mat = item.inventory_items
            return (
              <View
                key={i}
                style={[pdfStyles.tableRow, i % 2 === 1 ? { backgroundColor: LIGHT_BG } : {}]}
              >
                <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{mat?.name ?? "—"}</Text>
                <Text style={[pdfStyles.tableCellMuted, { flex: 1.2 }]}>{mat?.code ?? "—"}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 0.8, textAlign: "right" }]}>
                  {item.quantity_ordered} {mat?.unit}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 0.8, textAlign: "right" }]}>
                  {item.quantity_received} {mat?.unit}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {fmt(item.unit_price)}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 0.6, textAlign: "right" }]}>
                  {item.tax_percent}%
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.bold, { flex: 1.2, textAlign: "right" }]}>
                  {fmt(item.total_price)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Totals */}
        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          <View
            style={{
              width: 200,
              borderWidth: 1,
              borderColor: BORDER_COLOR,
              borderRadius: 4,
              padding: 8,
              backgroundColor: LIGHT_BG,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={pdfStyles.tableCellMuted}>Subtotal</Text>
              <Text style={pdfStyles.tableCell}>{fmt(po.subtotal)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={pdfStyles.tableCellMuted}>Tax</Text>
              <Text style={pdfStyles.tableCell}>{fmt(po.tax_amount)}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderTopWidth: 1,
                borderTopColor: BORDER_COLOR,
                paddingTop: 4,
              }}
            >
              <Text style={[pdfStyles.totalsLabel]}>Total</Text>
              <Text style={pdfStyles.totalsValue}>{fmt(po.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {po.notes && (
          <View style={{ marginTop: 14 }}>
            <Text style={pdfStyles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 8.5, color: "#374151", lineHeight: 1.6 }}>{po.notes}</Text>
          </View>
        )}

        <PdfFooter />
      </Page>
    </Document>
  )
}
