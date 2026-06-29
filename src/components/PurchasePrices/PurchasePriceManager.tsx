import { Download, Upload } from 'lucide-react'
import type { SKUSummary } from '../../types/report.types'
import { PriceInput } from '../SKUTable/PriceInput'

interface PurchasePriceManagerProps {
  items: SKUSummary[]
  onPriceChange: (sku: string, value: number | null) => void
  onImport: (rows: Array<{ sku: string; price: number }>) => void
}

function exportPrices(items: SKUSummary[]) {
  const lines = ['Артикул,Цена']
  for (const item of items) {
    lines.push(`${item.sku},${item.purchasePrice ?? ''}`)
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'wb-purchase-prices.csv'
  link.click()
  URL.revokeObjectURL(url)
}

async function parseCsv(file: File) {
  const content = await file.text()
  return content
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sku, price] = line.split(',')
      return {
        sku: sku?.trim() ?? '',
        price: Number(price?.replace(',', '.').trim()),
      }
    })
    .filter((row) => row.sku && Number.isFinite(row.price))
}

export function PurchasePriceManager({
  items,
  onPriceChange,
  onImport,
}: PurchasePriceManagerProps) {
  return (
    <section className="panel">
      <div className="panel__header panel__header--stack">
        <div>
          <p className="panel__eyebrow">Закупочные цены</p>
          <h3>Управление справочником закупки</h3>
        </div>

        <div className="table-toolbar">
          <label className="button button--ghost">
            <Upload size={16} />
            Импорт из CSV
            <input
              accept=".csv"
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }

                const rows = await parseCsv(file)
                onImport(rows)
                event.target.value = ''
              }}
              type="file"
            />
          </label>

          <button className="button button--ghost" onClick={() => exportPrices(items)} type="button">
            <Download size={16} />
            Экспорт в CSV
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Артикул</th>
              <th>Название</th>
              <th>Закупочная цена</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.sku}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>
                  <PriceInput
                    sku={item.sku}
                    value={item.purchasePrice}
                    onChange={(value) => onPriceChange(item.sku, value)}
                  />
                </td>
                <td>
                  {item.hasPurchasePrice ? (
                    <span className="status status--ok">Цена задана</span>
                  ) : (
                    <span className="status status--warn">Нужна цена</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
