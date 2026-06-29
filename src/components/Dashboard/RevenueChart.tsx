import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TotalSummary } from '../../types/report.types'
import { formatCurrency } from '../../utils/calculations'

interface RevenueChartProps {
  totalSummary: TotalSummary
}

export function RevenueChart({ totalSummary }: RevenueChartProps) {
  const data = [
    { name: 'Выплата WB', value: totalSummary.totalPayout, fill: '#3b82f6' },
    { name: 'Логистика', value: totalSummary.totalDelivery, fill: '#ef4444' },
    { name: 'Хранение', value: totalSummary.totalStorage, fill: '#f97316' },
    { name: 'Себестоимость', value: totalSummary.totalCOGS, fill: '#8b5cf6' },
    { name: 'Прибыль', value: totalSummary.totalNetProfit, fill: '#22c55e' },
  ]

  return (
    <article className="panel chart-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Доходы vs расходы</p>
          <h3>Ключевые денежные потоки</h3>
        </div>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
            <XAxis hide type="number" />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={110} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="value" radius={[0, 12, 12, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
