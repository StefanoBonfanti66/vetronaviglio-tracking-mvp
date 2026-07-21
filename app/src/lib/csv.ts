import type { Shipment, Carrier } from '../types/tracking'

const CSV_HEADERS = [
  'tracking_number',
  'carrier_code',
  'customer_name',
  'customer_reference',
  'order_number',
  'origin',
  'destination',
  'status',
  'notes',
]

export function parseCSV(text: string): string[][] {
  const lines = text.trim().split('\n')
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

export function validateCSV(rows: string[][], carriers: Carrier[]): {
  valid: Array<{
    tracking_number: string
    carrier_id: string
    customer_name?: string
    customer_reference?: string
    order_number?: string
    origin?: string
    destination?: string
    notes?: string
  }>
  errors: Array<{ row: number; message: string }>
} {
  const valid: Array<{
    tracking_number: string
    carrier_id: string
    customer_name?: string
    customer_reference?: string
    order_number?: string
    origin?: string
    destination?: string
    notes?: string
  }> = []
  const errors: Array<{ row: number; message: string }> = []

  if (rows.length < 2) {
    errors.push({ row: 0, message: 'Il file CSV deve avere un\'intestazione e almeno una riga di dati' })
    return { valid, errors }
  }

  const headers = rows[0].map(h => h.toLowerCase().trim())
  const trackingIdx = headers.indexOf('tracking_number')
  const carrierIdx = headers.indexOf('carrier_code')

  if (trackingIdx === -1) {
    errors.push({ row: 0, message: 'Colonna "tracking_number" mancante' })
    return { valid, errors }
  }
  if (carrierIdx === -1) {
    errors.push({ row: 0, message: 'Colonna "carrier_code" mancante' })
    return { valid, errors }
  }

  const carrierMap = new Map(carriers.map(c => [c.code.toLowerCase(), c.id]))

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue

    const trackingNumber = row[trackingIdx]?.trim()
    const carrierCode = row[carrierIdx]?.trim().toLowerCase()

    if (!trackingNumber) {
      errors.push({ row: i + 1, message: 'Tracking number vuoto' })
      continue
    }
    if (!carrierCode) {
      errors.push({ row: i + 1, message: 'Codice corriere vuoto' })
      continue
    }

    const carrierId = carrierMap.get(carrierCode)
    if (!carrierId) {
      errors.push({ row: i + 1, message: `Corriere "${carrierCode}" non trovato. Codici validi: ${[...carrierMap.keys()].join(', ')}` })
      continue
    }

    const getVal = (name: string): string | undefined => {
      const idx = headers.indexOf(name)
      const val = idx !== -1 ? row[idx]?.trim() : undefined
      return val || undefined
    }

    valid.push({
      tracking_number: trackingNumber,
      carrier_id: carrierId,
      customer_name: getVal('customer_name'),
      customer_reference: getVal('customer_reference'),
      order_number: getVal('order_number'),
      origin: getVal('origin'),
      destination: getVal('destination'),
      notes: getVal('notes'),
    })
  }

  return { valid, errors }
}

export function shipmentsToCSV(shipments: Shipment[]): string {
  const rows = [CSV_HEADERS.join(',')]
  for (const s of shipments) {
    const row = [
      s.tracking_number,
      s.carrier?.code ?? '',
      s.customer_name ?? '',
      s.customer_reference ?? '',
      s.order_number ?? '',
      s.origin ?? '',
      s.destination ?? '',
      s.status,
      s.notes ?? '',
    ].map(v => `"${v.replace(/"/g, '""')}"`)
    rows.push(row.join(','))
  }
  return rows.join('\n')
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
