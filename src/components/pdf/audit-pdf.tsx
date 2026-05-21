import { Document, Page, View, Text } from "@react-pdf/renderer"
import { PdfHeader } from "./shared/pdf-header"
import { PdfFooter } from "./shared/pdf-footer"
import { pdfStyles, getStatusColors, BORDER_COLOR, LIGHT_BG } from "./shared/pdf-styles"

interface AuditItem {
  item_id: string
  system_quantity: number
  physical_quantity: number
  variance: number
  variance_reason?: string
  inventory_items: { name: string; code: string; unit: string } | null
}

interface AuditPdfProps {
  audit: {
    audit_number: string
    status: string
    audit_date: string
    notes?: string
    sites: { name: string } | null
    profiles: { full_name: string } | null
    stock_audit_items: AuditItem[]
  }
  generatedBy?: string
}

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

export function AuditPdf({ audit, generatedBy }: AuditPdfProps) {
  const items = audit.stock_audit_items ?? []
  const discrepancies = items.filter((i) => i.variance !== 0)
  const overages = items.filter((i) => i.variance > 0).length
  const shortages = items.filter((i) => i.variance < 0).length

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} orientation="landscape">
        <PdfHeader
          reportType="Stock Audit"
          title={`Stock Audit Report — ${audit.audit_number}`}
          generatedBy={generatedBy}
          meta={{
            "Audit Number": audit.audit_number,
            Status: audit.status.replace(/_/g, " ").toUpperCase(),
            "Audit Date": fmtDate(audit.audit_date),
            Site: (audit.sites as any)?.name ?? "—",
            "Conducted By": (audit.profiles as any)?.full_name ?? "—",
            "Total Items": items.length.toString(),
            Discrepancies: discrepancies.length.toString(),
            Overages: overages.toString(),
            Shortages: shortages.toString(),
          }}
        />

        {/* Audit items table */}
        <Text style={pdfStyles.sectionTitle}>Audit Results</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHead}>
            <Text style={[pdfStyles.tableHeadCell, { flex: 3 }]}>Material</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1 }]}>Code</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 0.6 }]}>Unit</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>System Qty</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Physical Qty</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Variance</Text>
            <Text style={[pdfStyles.tableHeadCell, { flex: 3 }]}>Reason</Text>
          </View>

          {items.map((item, i) => {
            const mat = item.inventory_items
            const hasVariance = item.variance !== 0
            return (
              <View
                key={i}
                style={[
                  pdfStyles.tableRow,
                  i % 2 === 1 ? { backgroundColor: LIGHT_BG } : {},
                  item.variance < 0 ? { backgroundColor: "#fef2f2" } : {},
                  item.variance > 0 ? { backgroundColor: "#f0fdf4" } : {},
                ]}
              >
                <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{mat?.name ?? "—"}</Text>
                <Text style={[pdfStyles.tableCellMuted, { flex: 1 }]}>{mat?.code ?? "—"}</Text>
                <Text style={[pdfStyles.tableCellMuted, { flex: 0.6 }]}>{mat?.unit ?? "—"}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {item.system_quantity}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {item.physical_quantity}
                </Text>
                <Text
                  style={[
                    pdfStyles.tableCell,
                    pdfStyles.bold,
                    {
                      flex: 1,
                      textAlign: "right",
                      color: item.variance < 0 ? "#b91c1c" : item.variance > 0 ? "#15803d" : "#6b7280",
                    },
                  ]}
                >
                  {item.variance > 0 ? "+" : ""}
                  {item.variance}
                </Text>
                <Text style={[pdfStyles.tableCellMuted, { flex: 3 }]}>
                  {item.variance_reason ?? (hasVariance ? "No reason provided" : "—")}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Summary */}
        <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
          {[
            { label: "Total Items Audited", value: items.length.toString(), color: "#1a1a1a" },
            { label: "No Variance", value: (items.length - discrepancies.length).toString(), color: "#15803d" },
            { label: "Shortages", value: shortages.toString(), color: "#b91c1c" },
            { label: "Overages", value: overages.toString(), color: "#16a34a" },
          ].map(({ label, value, color }) => (
            <View
              key={label}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: BORDER_COLOR,
                backgroundColor: LIGHT_BG,
              }}
            >
              <Text style={[pdfStyles.infoLabel]}>{label}</Text>
              <Text style={[pdfStyles.infoValue, { fontSize: 12, color }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {audit.notes && (
          <View style={{ marginTop: 14 }}>
            <Text style={pdfStyles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 8.5, color: "#374151", lineHeight: 1.6 }}>{audit.notes}</Text>
          </View>
        )}

        <PdfFooter />
      </Page>
    </Document>
  )
}
