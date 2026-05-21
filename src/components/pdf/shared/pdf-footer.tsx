import { View, Text } from "@react-pdf/renderer"
import { pdfStyles } from "./pdf-styles"

export function PdfFooter() {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerText}>
        Blessing Homz Pvt. Ltd. — CSIMS · Confidential
      </Text>
      <Text
        style={pdfStyles.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  )
}
