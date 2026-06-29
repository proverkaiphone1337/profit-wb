import type {
  CostBreakdownItem,
  SKUSummary,
  TotalSummary,
  WBReportRow,
} from '../types/report.types'

const SALE_DOC_TYPES = new Set(['Продажа'])
const RETURN_DOC_TYPES = new Set(['Возврат'])

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null): string {
  if (value === null) {
    return '—'
  }

  return `${value.toFixed(1)}%`
}

export function formatDateRange(from?: string, to?: string): string {
  if (!from || !to) {
    return 'Период не определен'
  }

  const toDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day))
  }

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return `${formatter.format(toDate(from))} - ${formatter.format(toDate(to))}`
}

export function buildSkuSummaries(
  rows: WBReportRow[],
  purchasePrices: Record<string, number>,
): SKUSummary[] {
  const summaries = new Map<string, SKUSummary>()

  for (const row of rows) {
    const existing =
      summaries.get(row.sku) ??
      {
        sku: row.sku,
        name: row.name,
        category: row.category,
        salesQty: 0,
        returnsQty: 0,
        wbRevenue: 0,
        sellerPayout: 0,
        returnsAmount: 0,
        wbCommission: 0,
        deliveryCost: 0,
        storageCost: 0,
        fines: 0,
        deductions: 0,
        reimbursements: 0,
        purchasePrice: null,
        costOfGoods: 0,
        netProfit: 0,
        margin: null,
        hasPurchasePrice: false,
      }

    existing.wbCommission += row.wbCommission
    existing.deliveryCost += row.deliveryCost
    existing.storageCost += row.storageCost
    existing.fines += row.fines
    existing.deductions += row.deductions
    existing.reimbursements += row.reimbursements
    existing.sellerPayout += row.toSellerAmount

    if (SALE_DOC_TYPES.has(row.docType)) {
      existing.salesQty += row.qty
      existing.wbRevenue += row.wbSalePrice
    }

    if (RETURN_DOC_TYPES.has(row.docType)) {
      existing.returnsQty += Math.abs(row.qty)
      existing.returnsAmount += row.toSellerAmount
    }

    summaries.set(row.sku, existing)
  }

  const calculated = Array.from(summaries.values()).map((summary) => {
    const purchasePrice = purchasePrices[summary.sku]
    const hasPurchasePrice = Number.isFinite(purchasePrice)
    const costOfGoods = hasPurchasePrice ? summary.salesQty * purchasePrice : 0
    const netProfit =
      summary.sellerPayout -
      costOfGoods -
      summary.deliveryCost -
      summary.storageCost -
      summary.fines -
      summary.deductions +
      summary.reimbursements
    const margin = summary.sellerPayout !== 0 ? (netProfit / summary.sellerPayout) * 100 : null

    return {
      ...summary,
      wbRevenue: roundCurrency(summary.wbRevenue),
      sellerPayout: roundCurrency(summary.sellerPayout),
      returnsAmount: roundCurrency(summary.returnsAmount),
      wbCommission: roundCurrency(summary.wbCommission),
      deliveryCost: roundCurrency(summary.deliveryCost),
      storageCost: roundCurrency(summary.storageCost),
      fines: roundCurrency(summary.fines),
      deductions: roundCurrency(summary.deductions),
      reimbursements: roundCurrency(summary.reimbursements),
      purchasePrice: hasPurchasePrice ? purchasePrice : null,
      costOfGoods: roundCurrency(costOfGoods),
      netProfit: roundCurrency(netProfit),
      margin: margin === null ? null : Math.round(margin * 10) / 10,
      hasPurchasePrice,
    }
  })

  return calculated.sort((left, right) => right.sellerPayout - left.sellerPayout)
}

export function buildTotalSummary(skuSummary: SKUSummary[]): TotalSummary {
  const totals = skuSummary.reduce(
    (acc, item) => {
      acc.totalRevenue += item.wbRevenue
      acc.totalPayout += item.sellerPayout
      acc.totalCommission += item.wbCommission
      acc.totalDelivery += item.deliveryCost
      acc.totalStorage += item.storageCost
      acc.totalFines += item.fines
      acc.totalDeductions += item.deductions
      acc.totalReimbursements += item.reimbursements
      acc.totalCOGS += item.costOfGoods
      acc.totalNetProfit += item.netProfit
      acc.salesCount += item.salesQty
      acc.returnsCount += item.returnsQty

      if (!item.hasPurchasePrice) {
        acc.missingPurchasePriceCount += 1
      }

      return acc
    },
    {
      totalRevenue: 0,
      totalPayout: 0,
      totalCommission: 0,
      totalDelivery: 0,
      totalStorage: 0,
      totalFines: 0,
      totalDeductions: 0,
      totalReimbursements: 0,
      totalCOGS: 0,
      totalNetProfit: 0,
      salesCount: 0,
      returnsCount: 0,
      missingPurchasePriceCount: 0,
    },
  )

  const overallMargin = totals.totalPayout !== 0 ? (totals.totalNetProfit / totals.totalPayout) * 100 : null
  const effectiveCommissionRate =
    totals.totalRevenue !== 0 ? (totals.totalCommission / totals.totalRevenue) * 100 : null

  return {
    totalRevenue: roundCurrency(totals.totalRevenue),
    totalPayout: roundCurrency(totals.totalPayout),
    totalCommission: roundCurrency(totals.totalCommission),
    totalDelivery: roundCurrency(totals.totalDelivery),
    totalStorage: roundCurrency(totals.totalStorage),
    totalFines: roundCurrency(totals.totalFines),
    totalDeductions: roundCurrency(totals.totalDeductions),
    totalReimbursements: roundCurrency(totals.totalReimbursements),
    totalCOGS: roundCurrency(totals.totalCOGS),
    totalNetProfit: roundCurrency(totals.totalNetProfit),
    overallMargin: overallMargin === null ? null : Math.round(overallMargin * 10) / 10,
    salesCount: totals.salesCount,
    returnsCount: totals.returnsCount,
    uniqueSkus: skuSummary.length,
    missingPurchasePriceCount: totals.missingPurchasePriceCount,
    profitIsPartial: totals.missingPurchasePriceCount > 0,
    effectiveCommissionRate:
      effectiveCommissionRate === null ? null : Math.round(effectiveCommissionRate * 10) / 10,
  }
}

export function buildCostBreakdown(totalSummary: TotalSummary): CostBreakdownItem[] {
  return [
    { key: 'commission', label: 'Комиссия WB', value: totalSummary.totalCommission },
    { key: 'delivery', label: 'Логистика', value: totalSummary.totalDelivery },
    { key: 'storage', label: 'Хранение', value: totalSummary.totalStorage },
    { key: 'fines', label: 'Штрафы', value: totalSummary.totalFines },
    { key: 'deductions', label: 'Удержания', value: totalSummary.totalDeductions },
    { key: 'cogs', label: 'Себестоимость', value: totalSummary.totalCOGS },
  ].filter((item) => item.value > 0)
}
