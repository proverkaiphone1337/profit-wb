import {
  ArrowLeftRight,
  BadgePercent,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import type { TotalSummary } from '../../types/report.types'
import { formatCurrency, formatPercent } from '../../utils/calculations'

interface KPICardsProps {
  totalSummary: TotalSummary
}

export function KPICards({ totalSummary }: KPICardsProps) {
  const cards = [
    {
      label: 'Выплата WB',
      value: formatCurrency(totalSummary.totalPayout),
      tone: 'blue',
      icon: CircleDollarSign,
    },
    {
      label: 'Продажи',
      value: `${totalSummary.salesCount} шт.`,
      tone: 'slate',
      icon: ShoppingCart,
    },
    {
      label: 'Возвраты',
      value: `${totalSummary.returnsCount} шт.`,
      tone: 'orange',
      icon: ArrowLeftRight,
    },
    {
      label: 'Логистика',
      value: formatCurrency(totalSummary.totalDelivery),
      tone: 'red',
      icon: Truck,
    },
    {
      label: 'Себестоимость',
      value: formatCurrency(totalSummary.totalCOGS),
      tone: 'violet',
      icon: Package,
    },
    {
      label: 'Чистая прибыль',
      value: formatCurrency(totalSummary.totalNetProfit),
      tone: totalSummary.totalNetProfit >= 0 ? 'green' : 'red',
      icon: CircleDollarSign,
    },
    {
      label: 'Маржа',
      value: formatPercent(totalSummary.overallMargin),
      tone: totalSummary.totalNetProfit >= 0 ? 'green' : 'red',
      icon: BadgePercent,
    },
  ] as const

  return (
    <section className="kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article key={card.label} className={`kpi-card tone-${card.tone}`}>
            <div className="kpi-card__icon">
              <Icon size={20} />
            </div>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        )
      })}
    </section>
  )
}
