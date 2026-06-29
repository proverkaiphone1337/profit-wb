import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ParsedReportPayload,
  ReportHistoryEntry,
  ReportPeriod,
  SKUSummary,
  StoredReportSnapshot,
  TotalSummary,
  WBReportRow,
} from '../types/report.types'
import { buildSkuSummaries, buildTotalSummary } from '../utils/calculations'
import { parseReportFile } from '../utils/parseReport'

interface AppStore {
  reportData: WBReportRow[]
  reportPeriod: ReportPeriod | null
  reportFileName: string | null
  isLoading: boolean
  error: string | null
  purchasePrices: Record<string, number>
  reportHistory: StoredReportSnapshot[]
  skuSummary: SKUSummary[]
  totalSummary: TotalSummary
  loadReport: (file: File) => Promise<void>
  loadReportSnapshot: (snapshotId: string) => void
  setPurchasePrice: (sku: string, price: number | null) => void
  importPurchasePrices: (rows: Array<{ sku: string; price: number }>) => void
  clearReport: () => void
  clearError: () => void
  getHistoryEntries: () => ReportHistoryEntry[]
}

const EMPTY_TOTALS: TotalSummary = {
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
  overallMargin: null,
  salesCount: 0,
  returnsCount: 0,
  uniqueSkus: 0,
  missingPurchasePriceCount: 0,
  profitIsPartial: false,
  effectiveCommissionRate: null,
}

function computeDerivedState(rows: WBReportRow[], purchasePrices: Record<string, number>) {
  const skuSummary = buildSkuSummaries(rows, purchasePrices)
  const totalSummary = buildTotalSummary(skuSummary)
  return { skuSummary, totalSummary }
}

function pushHistoryEntry(
  history: StoredReportSnapshot[],
  payload: ParsedReportPayload,
): StoredReportSnapshot[] {
  const snapshot: StoredReportSnapshot = {
    id: `${Date.now()}`,
    fileName: payload.sourceFileName,
    uploadedAt: new Date().toISOString(),
    period: payload.period,
    rows: payload.rows,
  }

  return [snapshot, ...history].slice(0, 5)
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      reportData: [],
      reportPeriod: null,
      reportFileName: null,
      isLoading: false,
      error: null,
      purchasePrices: {},
      reportHistory: [],
      skuSummary: [],
      totalSummary: EMPTY_TOTALS,
      async loadReport(file) {
        set({ isLoading: true, error: null })

        try {
          const payload = await parseReportFile(file)
          const { skuSummary, totalSummary } = computeDerivedState(payload.rows, get().purchasePrices)

          set((state) => ({
            reportData: payload.rows,
            reportPeriod: payload.period,
            reportFileName: payload.sourceFileName,
            reportHistory: pushHistoryEntry(state.reportHistory, payload),
            skuSummary,
            totalSummary,
            isLoading: false,
            error: null,
          }))
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Не удалось обработать отчет.',
          })
        }
      },
      loadReportSnapshot(snapshotId) {
        const snapshot = get().reportHistory.find((item) => item.id === snapshotId)

        if (!snapshot) {
          return
        }

        const { skuSummary, totalSummary } = computeDerivedState(snapshot.rows, get().purchasePrices)
        set({
          reportData: snapshot.rows,
          reportPeriod: snapshot.period,
          reportFileName: snapshot.fileName,
          skuSummary,
          totalSummary,
          error: null,
        })
      },
      setPurchasePrice(sku, price) {
        set((state) => {
          const purchasePrices = { ...state.purchasePrices }

          if (price === null || Number.isNaN(price)) {
            delete purchasePrices[sku]
          } else {
            purchasePrices[sku] = price
          }

          const { skuSummary, totalSummary } = computeDerivedState(state.reportData, purchasePrices)

          return {
            purchasePrices,
            skuSummary,
            totalSummary,
          }
        })
      },
      importPurchasePrices(rows) {
        set((state) => {
          const purchasePrices = { ...state.purchasePrices }

          for (const row of rows) {
            purchasePrices[row.sku] = row.price
          }

          const { skuSummary, totalSummary } = computeDerivedState(state.reportData, purchasePrices)

          return {
            purchasePrices,
            skuSummary,
            totalSummary,
          }
        })
      },
      clearReport() {
        set({
          reportData: [],
          reportPeriod: null,
          reportFileName: null,
          skuSummary: [],
          totalSummary: EMPTY_TOTALS,
          error: null,
        })
      },
      clearError() {
        set({ error: null })
      },
      getHistoryEntries() {
        return get().reportHistory.map((snapshot) => {
          const summary = buildTotalSummary(buildSkuSummaries(snapshot.rows, get().purchasePrices))

          return {
            id: snapshot.id,
            fileName: snapshot.fileName,
            uploadedAt: snapshot.uploadedAt,
            period: snapshot.period,
            totalNetProfit: summary.totalNetProfit,
          }
        })
      },
    }),
    {
      name: 'wb-profit-calc-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        purchasePrices: state.purchasePrices,
        reportHistory: state.reportHistory,
      }),
    },
  ),
)
