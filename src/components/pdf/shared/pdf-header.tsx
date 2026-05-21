import { View, Text, Image } from "@react-pdf/renderer"
import { pdfStyles } from "./pdf-styles"

interface PdfHeaderProps {
  reportType: string
  title: string
  meta?: Record<string, string>
  generatedBy?: string
  /** URL or path to the company logo. Defaults to /fusion_logo.png from the public folder. */
  logoSrc?: string
}

export function PdfHeader({ reportType, title, meta = {}, generatedBy, logoSrc = "/fusion_logo.png" }: PdfHeaderProps) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <View>
      <View style={pdfStyles.headerRow}>
        {/* Left: Company identity */}
        <View>
          <Image src={logoSrc} style={pdfStyles.companyLogo} />
          <Text style={pdfStyles.companyName}>Blessing Homz Pvt. Ltd.</Text>
          <Text style={pdfStyles.companyTagline}>Construction Site Inventory Management System</Text>
        </View>
        {/* Right: Report label + date */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={pdfStyles.reportBadge}>{reportType}</Text>
          <Text style={pdfStyles.headerMeta}>{today}</Text>
          {generatedBy && <Text style={pdfStyles.headerMeta}>Prepared by: {generatedBy}</Text>}
        </View>
      </View>

      <View style={pdfStyles.headerDivider} />

      {/* Document title */}
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Helvetica-Bold",
          marginBottom: 10,
          color: "#1a1a1a",
        }}
      >
        {title}
      </Text>

      {/* Optional meta grid */}
      {Object.keys(meta).length > 0 && (
        <View style={pdfStyles.infoGrid}>
          {Object.entries(meta).map(([label, value]) => (
            <View key={label} style={pdfStyles.infoCell}>
              <Text style={pdfStyles.infoLabel}>{label}</Text>
              <Text style={pdfStyles.infoValue}>{value || "—"}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
