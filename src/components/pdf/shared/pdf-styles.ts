import { StyleSheet, Font } from "@react-pdf/renderer"

export const BRAND_GREEN = "#8CB82B"
export const BRAND_DARK = "#58585A"
export const TEXT_PRIMARY = "#1a1a1a"
export const TEXT_MUTED = "#6b7280"
export const BORDER_COLOR = "#e5e7eb"
export const LIGHT_BG = "#f9fafb"

export const pdfStyles = StyleSheet.create({
  // ── Page ──────────────────────────────────────────────
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT_PRIMARY,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },

  // ── Header ─────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyLogo: {
    width: 90,
    height: 36,
    objectFit: "contain",
    marginBottom: 3,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BRAND_GREEN,
    letterSpacing: 0.3,
  },
  companyTagline: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  reportBadge: {
    backgroundColor: BRAND_GREEN,
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerMeta: {
    fontSize: 8,
    color: TEXT_MUTED,
    textAlign: "right",
    marginTop: 4,
    lineHeight: 1.6,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND_GREEN,
    marginBottom: 16,
  },

  // ── Section headings ────────────────────────────────────
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND_DARK,
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  // ── Info Grid ──────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    padding: 10,
    backgroundColor: LIGHT_BG,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  infoCell: {
    width: "30%",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
  },

  // ── Table ──────────────────────────────────────────────
  table: {
    marginTop: 4,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: BRAND_GREEN,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  tableHeadCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },
  tableCell: {
    fontSize: 8.5,
    color: TEXT_PRIMARY,
  },
  tableCellMuted: {
    fontSize: 8,
    color: TEXT_MUTED,
  },

  // ── Totals row ─────────────────────────────────────────
  totalsRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 2,
    borderTopColor: BRAND_GREEN,
    marginTop: 2,
  },
  totalsLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND_DARK,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND_GREEN,
  },

  // ── Status badges ──────────────────────────────────────
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },

  // ── Footer ─────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: TEXT_MUTED,
  },

  // ── Misc ──────────────────────────────────────────────
  spacer: { marginTop: 8 },
  bold: { fontFamily: "Helvetica-Bold" },
  right: { textAlign: "right" },
  center: { textAlign: "center" },
})

/** Status colour map used in PDF badges */
export function getStatusColors(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    draft: { bg: "#f3f4f6", text: "#374151" },
    sent: { bg: "#eff6ff", text: "#1d4ed8" },
    partially_received: { bg: "#fff7ed", text: "#c2410c" },
    received: { bg: "#f0fdf4", text: "#15803d" },
    cancelled: { bg: "#fef2f2", text: "#b91c1c" },
    pending: { bg: "#fff7ed", text: "#c2410c" },
    partially_paid: { bg: "#eff6ff", text: "#1d4ed8" },
    paid: { bg: "#f0fdf4", text: "#15803d" },
    overdue: { bg: "#fef2f2", text: "#b91c1c" },
    in_progress: { bg: "#eff6ff", text: "#1d4ed8" },
    completed: { bg: "#f0fdf4", text: "#15803d" },
    reviewed: { bg: "#faf5ff", text: "#7e22ce" },
  }
  return map[status] ?? { bg: "#f3f4f6", text: "#374151" }
}
