import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CostBreakdownItem } from '../../types/report.types'
import { formatCurrency } from '../../utils/calculations'

const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#e11d48', '#14b8a6']

interface CostsPieChartProps {
  data: CostBreakdownItem[]
}

export function CostsPieChart({ data }: CostsPieChartProps) {
  return (
    <article className="panel chart-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Структура расходов</p>
          <h3>Из чего складывается расход</h3>
        </div>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              nameKey="label"
            >
              {data.map((entry, index) => (
                <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
