export interface WBReportRow {
  sku: string
  name: string
  category: string
  docType: string
  paymentReason: string
  qty: number
  retailPrice: number
  wbSalePrice: number
  toSellerAmount: number
  wbCommission: number
  wbCommissionRate: number
  deliveryCost: number
  storageCost: number
  fines: number
  deductions: number
  reimbursements: number
  saleDate: string
}

export interface SKUSummary {
  sku: string
  name: string
  category: string
  salesQty: number
  returnsQty: number
  wbRevenue: number
  sellerPayout: number
  returnsAmount: number
  wbCommission: number
  deliveryCost: number
  storageCost: number
  fines: number
  deductions: number
  reimbursements: number
  purchasePrice: number | null
  costOfGoods: number
  netProfit: number
  margin: number | null
  hasPurchasePrice: boolean
}

export interface CostBreakdownItem {
  key: string
  label: string
  value: number
}

export interface TotalSummary {
  totalRevenue: number
  totalPayout: number
  totalCommission: number
  totalDelivery: number
  totalStorage: number
  totalFines: number
  totalDeductions: number
  totalReimbursements: number
  totalCOGS: number
  totalNetProfit: number
  overallMargin: number | null
  salesCount: number
  returnsCount: number
  uniqueSkus: number
  missingPurchasePriceCount: number
  profitIsPartial: boolean
  effectiveCommissionRate: number | null
}

export interface ReportPeriod {
  from: string
  to: string
}

export interface ParsedReportPayload {
  rows: WBReportRow[]
  period: ReportPeriod | null
  sourceFileName: string
}

export interface StoredReportSnapshot {
  id: string
  fileName: string
  uploadedAt: string
  period: ReportPeriod | null
  rows: WBReportRow[]
}

export interface ReportHistoryEntry {
  id: string
  fileName: string
  uploadedAt: string
  period: ReportPeriod | null
  totalNetProfit: number
}

export type AppSection = 'dashboard' | 'products' | 'costs' | 'prices'
