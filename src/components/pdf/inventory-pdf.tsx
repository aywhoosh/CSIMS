import { Document, Page, View, Text } from "@react-pdf/renderer"
import { PdfHeader } from "./shared/pdf-header"
import { PdfFooter } from "./shared/pdf-footer"
import { pdfStyles, BORDER_COLOR, LIGHT_BG } from "./shared/pdf-styles"

interface InventoryItem {
  id: string
  name: string
  code: string
  unit: string
  current_stock: number
  minimum_stock: number
  reorder_quantity: number
  unit_price: number
  categories: { name: string } | null
  sites: { name: string } | null
  storage_locations: { name: string } | null
}

interface InventoryPdfProps {
  items: InventoryItem[]
  siteName?: string
  generatedBy?: string
}

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function InventoryPdf({ items, siteName, generatedBy }: InventoryPdfProps) {
  // Group by category
  const grouped: Record<string, InventoryItem[]> = {}
  for (const item of items) {
    const cat = (item.categories as any)?.name ?? "Uncategorized"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  const totalValue = items.reduce((s, i) => s + i.current_stock * i.unit_price, 0)
  const lowStockCount = items.filter((i) => i.current_stock <= i.minimum_stock).length

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} orientation="landscape">
        <PdfHeader
          reportType="Inventory Report"
          title={`Inventory Report${siteName ? ` — ${siteName}` : ""}`}
          generatedBy={generatedBy}
          meta={{
            "Total Items": items.length.toString(),
            "Low Stock Items": lowStockCount.toString(),
            "Total Value": fmt(totalValue),
            Site: siteName ?? "All Sites",
            Categories: Object.keys(grouped).length.toString(),
          }}
        />

        {/* Per-category sections */}
        {Object.entries(grouped).map(([category, catItems]) => {
          const catValue = catItems.reduce((s, i) => s + i.current_stock * i.unit_price, 0)
          return (
            <View key={category} wrap={false} style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={pdfStyles.sectionTitle}>{category}</Text>
                <Text style={[pdfStyles.tableCellMuted, { fontSize: 8 }]}>
                  {catItems.length} items · {fmt(catValue)}
                </Text>
              </View>

              <View style={pdfStyles.table}>
                <View style={pdfStyles.tableHead}>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 2.5 }]}>Material</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 1 }]}>Code</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 1 }]}>Location</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 0.7, textAlign: "right" }]}>Current</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 0.7, textAlign: "right" }]}>Min</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 0.7, textAlign: "right" }]}>Reorder</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 0.6, textAlign: "right" }]}>Unit</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Unit Price</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 1.2, textAlign: "right" }]}>Value</Text>
                  <Text style={[pdfStyles.tableHeadCell, { flex: 0.8 }]}>Status</Text>
                </View>

                {catItems.map((item, i) => {
                  const isLow = item.current_stock <= item.minimum_stock
                  return (
                    <View
                      key={item.id}
                      style={[
                        pdfStyles.tableRow,
                        i % 2 === 1 ? { backgroundColor: LIGHT_BG } : {},
                        isLow ? { backgroundColor: "#fef2f2" } : {},
                      ]}
                    >
                      <Text style={[pdfStyles.tableCell, { flex: 2.5 }]}>{item.name}</Text>
                      <Text style={[pdfStyles.tableCellMuted, { flex: 1 }]}>{item.code}</Text>
                      <Text style={[pdfStyles.tableCellMuted, { flex: 1 }]}>
                        {(item.storage_locations as any)?.name ?? "—"}
                      </Text>
                      <Text style={[pdfStyles.tableCell, { flex: 0.7, textAlign: "right" }]}>
                        {item.current_stock}
                      </Text>
                      <Text style={[pdfStyles.tableCellMuted, { flex: 0.7, textAlign: "right" }]}>
                        {item.minimum_stock}
                      </Text>
                      <Text style={[pdfStyles.tableCellMuted, { flex: 0.7, textAlign: "right" }]}>
                        {item.reorder_quantity}
                      </Text>
                      <Text style={[pdfStyles.tableCellMuted, { flex: 0.6, textAlign: "right" }]}>
                        {item.unit}
                      </Text>
                      <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "right" }]}>
                        {fmt(item.unit_price)}
                      </Text>
                      <Text style={[pdfStyles.tableCell, pdfStyles.bold, { flex: 1.2, textAlign: "right" }]}>
                        {fmt(item.current_stock * item.unit_price)}
                      </Text>
                      <Text
                        style={[
                          pdfStyles.tableCell,
                          { flex: 0.8, color: isLow ? "#b91c1c" : "#15803d", fontFamily: "Helvetica-Bold" },
                        ]}
                      >
                        {isLow ? "LOW" : "OK"}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}

        {/* Grand total */}
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "flex-end",
            borderTopWidth: 2,
            borderTopColor: "#8CB82B",
            paddingTop: 6,
          }}
        >
          <Text style={[pdfStyles.totalsLabel, { marginRight: 16 }]}>
            Grand Total ({items.length} items)
          </Text>
          <Text style={pdfStyles.totalsValue}>{fmt(totalValue)}</Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}
