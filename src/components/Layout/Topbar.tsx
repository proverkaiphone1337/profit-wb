import { Clock3, FileSpreadsheet, Upload } from 'lucide-react'
import type { ReportHistoryEntry, ReportPeriod } from '../../types/report.types'
import { formatCurrency, formatDateRange } from '../../utils/calculations'

interface TopbarProps {
  fileName: string | null
  period: ReportPeriod | null
  history: ReportHistoryEntry[]
  onSelectHistory: (snapshotId: string) => void
  onPickFile: () => void
}

export function Topbar({ fileName, period, history, onSelectHistory, onPickFile }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="topbar__label">Активный отчет</p>
        <h2>{fileName ?? 'Загрузите weekly-отчет Wildberries'}</h2>
        <div className="topbar__meta">
          <span>
            <Clock3 size={16} />
            {period ? formatDateRange(period.from, period.to) : 'Период появится после загрузки'}
          </span>
          <span>
            <FileSpreadsheet size={16} />
            Поддерживаются `.xlsx` и `.zip`
          </span>
        </div>
      </div>

      <div className="topbar__actions">
        {history.length > 0 ? (
          <select
            aria-label="История отчетов"
            className="field field--select"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                onSelectHistory(event.target.value)
                event.target.value = ''
              }
            }}
          >
            <option value="">История отчетов</option>
            {history.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.fileName} • {formatCurrency(entry.totalNetProfit)}
              </option>
            ))}
          </select>
        ) : null}

        <button className="button button--primary" onClick={onPickFile} type="button">
          <Upload size={18} />
          Загрузить отчет
        </button>
      </div>
    </header>
  )
}
