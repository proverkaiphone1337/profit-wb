import type { ParsedReportPayload, ReportPeriod, WBReportRow } from '../types/report.types'

const COLUMN_MAP = {
  'Артикул поставщика': 'sku',
  Название: 'name',
  Предмет: 'category',
  'Тип документа': 'docType',
  'Обоснование для оплаты': 'paymentReason',
  'Кол-во': 'qty',
  'Цена розничная': 'retailPrice',
  'Вайлдберриз реализовал Товар (Пр)': 'wbSalePrice',
  'К перечислению Продавцу за реализованный Товар': 'toSellerAmount',
  'Вознаграждение Вайлдберриз (ВВ), без НДС': 'wbCommission',
  'Размер кВВ, %': 'wbCommissionRate',
  'Услуги по доставке товара покупателю': 'deliveryCost',
  Хранение: 'storageCost',
  'Общая сумма штрафов': 'fines',
  Удержания: 'deductions',
  'Возмещение издержек по перевозке/по складским операциям с товаром': 'reimbursements',
  'Дата продажи': 'saleDate',
} as const satisfies Record<string, keyof WBReportRow>

type RawRow = Record<string, unknown>

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').replace(',', '.')

    if (!normalized) {
      return 0
    }

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function formatExcelDate(value: unknown, xlsx: typeof import('xlsx')): string {
  if (typeof value === 'number') {
    const parsed = xlsx.SSF.parse_date_code(value)
    if (!parsed) {
      return ''
    }

    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d))
    return date.toISOString().slice(0, 10)
  }

  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  return ''
}

function mapRow(rawRow: RawRow, xlsx: typeof import('xlsx')): WBReportRow | null {
  const sku = String(rawRow['Артикул поставщика'] ?? '').trim()

  if (!sku || sku === 'undefined' || sku === 'null') {
    return null
  }

  return {
    sku,
    name: String(rawRow['Название'] ?? '').trim(),
    category: String(rawRow['Предмет'] ?? '').trim(),
    docType: String(rawRow['Тип документа'] ?? '').trim(),
    paymentReason: String(rawRow['Обоснование для оплаты'] ?? '').trim(),
    qty: normalizeNumber(rawRow['Кол-во']),
    retailPrice: normalizeNumber(rawRow['Цена розничная']),
    wbSalePrice: normalizeNumber(rawRow['Вайлдберриз реализовал Товар (Пр)']),
    toSellerAmount: normalizeNumber(rawRow['К перечислению Продавцу за реализованный Товар']),
    wbCommission: normalizeNumber(rawRow['Вознаграждение Вайлдберриз (ВВ), без НДС']),
    wbCommissionRate: normalizeNumber(rawRow['Размер кВВ, %']),
    deliveryCost: normalizeNumber(rawRow['Услуги по доставке товара покупателю']),
    storageCost: normalizeNumber(rawRow['Хранение']),
    fines: normalizeNumber(rawRow['Общая сумма штрафов']),
    deductions: normalizeNumber(rawRow['Удержания']),
    reimbursements: normalizeNumber(
      rawRow['Возмещение издержек по перевозке/по складским операциям с товаром'],
    ),
    saleDate: formatExcelDate(rawRow['Дата продажи'], xlsx),
  }
}

function getPeriod(rows: WBReportRow[]): ReportPeriod | null {
  const dates = rows.map((row) => row.saleDate).filter(Boolean).sort()

  if (!dates.length) {
    return null
  }

  return {
    from: dates[0],
    to: dates[dates.length - 1],
  }
}

async function getWorkbookBuffer(file: File): Promise<ArrayBuffer> {
  if (file.name.toLowerCase().endsWith('.zip')) {
    const { default: JSZip } = await import('jszip')
    const zip = await JSZip.loadAsync(file)
    const workbookEntry = Object.values(zip.files).find(
      (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.xlsx'),
    )

    if (!workbookEntry) {
      throw new Error('В ZIP-архиве не найден файл .xlsx.')
    }

    return workbookEntry.async('arraybuffer')
  }

  return file.arrayBuffer()
}

export async function parseReportFile(file: File): Promise<ParsedReportPayload> {
  const XLSX = await import('xlsx')
  const buffer = await getWorkbookBuffer(file)
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error('Файл отчета пустой.')
  }

  const sheet = workbook.Sheets[sheetName]
  const jsonRows = XLSX.utils.sheet_to_json<RawRow>(sheet, {
    defval: '',
    raw: false,
  })

  const rows = jsonRows.map((row) => mapRow(row, XLSX)).filter((row): row is WBReportRow => row !== null)
  const missingColumns = Object.keys(COLUMN_MAP).filter((column) => !(column in (jsonRows[0] ?? {})))

  if (!rows.length) {
    throw new Error('Не удалось найти строки с артикулом поставщика.')
  }

  if (missingColumns.length) {
    throw new Error(`В файле не найдены обязательные колонки: ${missingColumns.join(', ')}`)
  }

  return {
    rows,
    period: getPeriod(rows),
    sourceFileName: file.name,
  }
}
