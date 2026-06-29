import { BarChart3, Boxes, Calculator, ReceiptText } from 'lucide-react'
import type { AppSection } from '../../types/report.types'

interface SidebarProps {
  activeSection: AppSection
  onSelect: (section: AppSection) => void
}

const items: Array<{ id: AppSection; label: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Товары', icon: Boxes },
  { id: 'costs', label: 'Расходы', icon: ReceiptText },
  { id: 'prices', label: 'Закупки', icon: Calculator },
]

export function Sidebar({ activeSection, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        <p className="sidebar__eyebrow">Wildberries</p>
        <h1 className="sidebar__title">Profit Calc</h1>
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              className={`sidebar__link ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
