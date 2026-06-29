import { AlertTriangle, FileWarning, Sparkles } from 'lucide-react'
import { startTransition, useMemo, useRef, useState } from 'react'
import { CostsPanel } from './components/CostsPanel/CostsPanel'
import { CostsPieChart } from './components/Dashboard/CostsPieChart'
import { KPICards } from './components/Dashboard/KPICards'
import { RevenueChart } from './components/Dashboard/RevenueChart'
import { SKUChart } from './components/Dashboard/SKUChart'
import { Sidebar } from './components/Layout/Sidebar'
import { Topbar } from './components/Layout/Topbar'
import { PurchasePriceManager } from './components/PurchasePrices/PurchasePriceManager'
import { SKUTable } from './components/SKUTable/SKUTable'
import { UploadZone } from './components/Upload/UploadZone'
import { useAppStore } from './store/useAppStore'
import type { AppSection } from './types/report.types'
import { buildCostBreakdown, formatCurrency } from './utils/calculations'

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const {
    reportFileName,
    reportPeriod,
    isLoading,
    error,
    skuSummary,
    totalSummary,
    loadReport,
    loadReportSnapshot,
    setPurchasePrice,
    importPurchasePrices,
    clearError,
    getHistoryEntries,
  } = useAppStore()

  const hasReport = skuSummary.length > 0
  const historyEntries = getHistoryEntries()
  const costBreakdown = useMemo(() => buildCostBreakdown(totalSummary), [totalSummary])

  function handleFile(file: File) {
    startTransition(() => {
      void loadReport(file).then(() => {
        setActiveSection('dashboard')
      })
    })
  }

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} />

      <main className="main-content">
        <Topbar
          fileName={reportFileName}
          history={historyEntries}
          onPickFile={() => fileInputRef.current?.click()}
          onSelectHistory={loadReportSnapshot}
          period={reportPeriod}
        />

        <input
          ref={fileInputRef}
          accept=".xlsx,.zip"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              handleFile(file)
              event.target.value = ''
            }
          }}
          type="file"
        />

        {error ? (
          <div className="alert alert--danger" role="alert">
            <FileWarning size={18} />
            <div>
              <strong>Не удалось обработать отчет.</strong>
              <p>{error}</p>
            </div>
            <button className="button button--ghost" onClick={clearError} type="button">
              Закрыть
            </button>
          </div>
        ) : null}

        {!hasReport ? (
          <>
            <UploadZone isLoading={isLoading} onFileSelected={handleFile} />

            <section className="welcome-grid">
              <article className="panel welcome-panel">
                <Sparkles size={20} />
                <h3>Что уже умеет приложение</h3>
                <p>
                  Распаковывает `.zip`, агрегирует показатели по SKU, хранит закупочные цены в
                  `localStorage`, считает чистую прибыль и дает экспорт в Excel.
                </p>
              </article>

              <article className="panel welcome-panel">
                <AlertTriangle size={20} />
                <h3>На что обратить внимание</h3>
                <p>
                  Пока не заданы закупочные цены, итоговая прибыль считается частично. Такие SKU
                  помечаются предупреждением и учитываются отдельно в сводке.
                </p>
              </article>
            </section>
          </>
        ) : (
          <>
            {totalSummary.profitIsPartial ? (
              <div className="alert alert--warning">
                <AlertTriangle size={18} />
                <div>
                  <strong>Прибыль рассчитана частично.</strong>
                  <p>
                    Для {totalSummary.missingPurchasePriceCount} SKU еще не задана закупочная цена.
                  </p>
                </div>
              </div>
            ) : null}

            {activeSection === 'dashboard' ? (
              <>
                <KPICards totalSummary={totalSummary} />

                <section className="charts-grid">
                  <RevenueChart totalSummary={totalSummary} />
                  <SKUChart items={skuSummary} />
                  <CostsPieChart data={costBreakdown} />
                </section>

                <section className="summary-strip">
                  <div className="summary-strip__item">
                    <span>Уникальных SKU</span>
                    <strong>{totalSummary.uniqueSkus}</strong>
                  </div>
                  <div className="summary-strip__item">
                    <span>Возмещение издержек</span>
                    <strong>{formatCurrency(totalSummary.totalReimbursements)}</strong>
                  </div>
                  <div className="summary-strip__item">
                    <span>Комиссия WB</span>
                    <strong>{formatCurrency(totalSummary.totalCommission)}</strong>
                  </div>
                </section>
              </>
            ) : null}

            {activeSection === 'products' ? (
              <SKUTable items={skuSummary} onPriceChange={setPurchasePrice} />
            ) : null}

            {activeSection === 'costs' ? <CostsPanel totalSummary={totalSummary} /> : null}

            {activeSection === 'prices' ? (
              <PurchasePriceManager
                items={skuSummary}
                onImport={importPurchasePrices}
                onPriceChange={setPurchasePrice}
              />
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}

export default App
