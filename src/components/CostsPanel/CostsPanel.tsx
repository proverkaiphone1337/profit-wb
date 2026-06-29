import type { TotalSummary } from '../../types/report.types'
import { formatCurrency, formatPercent } from '../../utils/calculations'

interface CostsPanelProps {
  totalSummary: TotalSummary
}

export function CostsPanel({ totalSummary }: CostsPanelProps) {
  const rows = [
    ['Комиссия WB', totalSummary.totalCommission],
    ['Логистика', totalSummary.totalDelivery],
    ['Хранение', totalSummary.totalStorage],
    ['Штрафы', totalSummary.totalFines],
    ['Удержания', totalSummary.totalDeductions],
    ['Возмещение издержек', -totalSummary.totalReimbursements],
  ] as const

  const marketplaceExpenses =
    totalSummary.totalCommission +
    totalSummary.totalDelivery +
    totalSummary.totalStorage +
    totalSummary.totalFines +
    totalSummary.totalDeductions -
    totalSummary.totalReimbursements

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Детализация расходов</p>
          <h3>Расходы Wildberries</h3>
        </div>
        <div className="stat-badge">
          Эффективная комиссия: {formatPercent(totalSummary.effectiveCommissionRate)}
        </div>
      </div>

      <div className="cost-grid">
        <div className="cost-grid__table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Сумма</th>
                <th>% от выплаты</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{formatCurrency(value)}</td>
                  <td>
                    {formatPercent(
                      totalSummary.totalPayout !== 0 ? (value / totalSummary.totalPayout) * 100 : null,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cost-grid__summary">
          <div className="summary-card">
            <p>Итого расходы WB</p>
            <strong>{formatCurrency(marketplaceExpenses)}</strong>
          </div>
          <div className="summary-card">
            <p>Себестоимость</p>
            <strong>{formatCurrency(totalSummary.totalCOGS)}</strong>
          </div>
          <div className="summary-card">
            <p>Чистая прибыль</p>
            <strong className={totalSummary.totalNetProfit >= 0 ? 'profit-positive' : 'profit-negative'}>
              {formatCurrency(totalSummary.totalNetProfit)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}
