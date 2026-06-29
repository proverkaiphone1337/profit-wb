import type { SKUSummary } from '../types/report.types'

export async function exportSkuSummaryToExcel(rows: SKUSummary[]): Promise<void> {
  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((row) => ({
      Артикул: row.sku,
      Название: row.name,
      Категория: row.category,
      'Продаж, шт.': row.salesQty,
      'Возвратов, шт.': row.returnsQty,
      'Выручка WB, ₽': row.wbRevenue,
      'Выплата продавцу, ₽': row.sellerPayout,
      'Комиссия WB, ₽': row.wbCommission,
      'Логистика, ₽': row.deliveryCost,
      'Хранение, ₽': row.storageCost,
      'Штрафы, ₽': row.fines,
      'Удержания, ₽': row.deductions,
      'Возмещение, ₽': row.reimbursements,
      'Закупочная цена, ₽': row.purchasePrice ?? '',
      'Себестоимость, ₽': row.costOfGoods,
      'Чистая прибыль, ₽': row.netProfit,
      'Маржа, %': row.margin ?? '',
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SKU Summary')
  XLSX.writeFile(workbook, 'wb-profit-summary.xlsx')
}
