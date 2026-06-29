import { Download, Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import type { SKUSummary } from '../../types/report.types'
import { formatCurrency, formatPercent } from '../../utils/calculations'
import { exportSkuSummaryToExcel } from '../../utils/exportExcel'
import { PriceInput } from './PriceInput'

type SortKey =
  | 'sku'
  | 'name'
  | 'category'
  | 'salesQty'
  | 'returnsQty'
  | 'wbRevenue'
  | 'sellerPayout'
  | 'deliveryCost'
  | 'storageCost'
  | 'purchasePrice'
  | 'costOfGoods'
  | 'netProfit'
  | 'margin'

interface SKUTableProps {
  items: SKUSummary[]
  onPriceChange: (sku: string, value: number | null) => void
}

export function SKUTable({ items, onPriceChange }: SKUTableProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('sellerPayout')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const deferredQuery = useDeferredValue(query)

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort()],
    [items],
  )

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    const filtered = items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.sku.toLowerCase().includes(normalizedQuery) ||
        item.name.toLowerCase().includes(normalizedQuery)

      const matchesCategory = category === 'all' || item.category === category

      return matchesQuery && matchesCategory
    })

    filtered.sort((left, right) => {
      const leftValue = left[sortKey] ?? 0
      const rightValue = right[sortKey] ?? 0

      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return sortDirection === 'asc'
          ? leftValue.localeCompare(rightValue, 'ru')
          : rightValue.localeCompare(leftValue, 'ru')
      }

      return sortDirection === 'asc'
        ? Number(leftValue) - Number(rightValue)
        : Number(rightValue) - Number(leftValue)
    })

    return filtered
  }, [items, deferredQuery, category, sortDirection, sortKey])

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDirection('desc')
  }

  return (
    <section className="panel">
      <div className="panel__header panel__header--stack">
        <div>
          <p className="panel__eyebrow">SKU-таблица</p>
          <h3>Разбор по артикулам</h3>
        </div>

        <div className="table-toolbar">
          <label className="field field--search">
            <Search size={16} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по артикулу или названию"
              type="search"
              value={query}
            />
          </label>

          <select
            className="field field--select"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'Все категории' : item}
              </option>
            ))}
          </select>

          <button
            className="button button--ghost"
            onClick={() => {
              void exportSkuSummaryToExcel(filteredItems)
            }}
            type="button"
          >
            <Download size={16} />
            Экспорт в Excel
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table data-table--sticky">
          <thead>
            <tr>
              <th>
                <button className="sort-button" onClick={() => toggleSort('sku')} type="button">
                  Артикул
                </button>
              </th>
              <th>
                <button className="sort-button" onClick={() => toggleSort('name')} type="button">
                  Название
                </button>
              </th>
              <th>Категория</th>
              <th>Продаж</th>
              <th>Возвратов</th>
              <th>Выручка WB</th>
              <th>Выплата</th>
              <th>Логистика</th>
              <th>Хранение</th>
              <th>Закупка</th>
              <th>Себестоимость</th>
              <th>Прибыль</th>
              <th>Маржа</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.sku}>
                <td>{item.sku}</td>
                <td>
                  <div className="cell-title">
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td>{item.category}</td>
                <td>{item.salesQty}</td>
                <td>{item.returnsQty}</td>
                <td>{formatCurrency(item.wbRevenue)}</td>
                <td>{formatCurrency(item.sellerPayout)}</td>
                <td>{formatCurrency(item.deliveryCost)}</td>
                <td>{formatCurrency(item.storageCost)}</td>
                <td>
                  <PriceInput
                    sku={item.sku}
                    value={item.purchasePrice}
                    onChange={(value) => onPriceChange(item.sku, value)}
                  />
                </td>
                <td>{formatCurrency(item.costOfGoods)}</td>
                <td className={item.netProfit >= 0 ? 'profit-positive' : 'profit-negative'}>
                  {formatCurrency(item.netProfit)}
                </td>
                <td>{formatPercent(item.margin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
