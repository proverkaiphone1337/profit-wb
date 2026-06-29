import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SKUSummary } from '../../types/report.types'
import { formatCurrency } from '../../utils/calculations'

interface SKUChartProps {
  items: SKUSummary[]
}

export function SKUChart({ items }: SKUChartProps) {
  const data = items.slice(0, 10).map((item) => ({
    sku: item.sku,
    revenue: item.wbRevenue,
  }))

  return (
    <article className="panel chart-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Топ-10 по выручке</p>
          <h3>Продажи по артикулам</h3>
        </div>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
            <XAxis dataKey="sku" tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" fill="#22c55e" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
