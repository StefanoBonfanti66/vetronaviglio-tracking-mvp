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

const COLUMN_ALIASES: Record<string, string> = {
  'numero di monitoraggio': 'tracking_number',
  'nome del contatto del destinatario': 'customer_name',
  'società destinataria': 'customer_name',
  'città del mittente': 'origin',
  'città del destinatario': 'destination',
  'riferimento': 'customer_reference',
  'numero ordine d\'acquisto': 'order_number',
  'stato': 'status',
  'stato con dettagli': 'status',
  'note': 'notes',
}

const CARRIER_NAME_MAP: Record<string, string> = {
  'fedex': 'fedex',
  'dhl': 'dhl',
  'gls': 'gls',
  'brt': 'brt',
  'sda': 'sda',
  'tnt': 'tnt',
  'bartolini': 'brt',
  'italiana': 'sda',
}

export function detectCarrierFromHeaders(rows: string[][]): string | undefined {
  if (rows.length < 2) return undefined
  const headers = rows[0].map(h => h.toLowerCase().trim().replace(/\s+/g, ' '))
  const fedExIdx = headers.indexOf('società fedex')
  if (fedExIdx === -1) return undefined
  const sample = rows[1][fedExIdx]?.trim().toLowerCase()
  if (!sample) return undefined
  for (const [key, code] of Object.entries(CARRIER_NAME_MAP)) {
    if (sample.includes(key)) return code
  }
  return undefined
}

function detectDelimiter(text: string): string {
  const firstLine = text.trim().split('\n')[0]
  const commaCount = (firstLine.match(/,/g) || []).length
  const tabCount = (firstLine.match(/\t/g) || []).length
  return tabCount > commaCount ? '\t' : ','
}

export function parseCSV(text: string): string[][] {
  const clean = stripBOM(text)
  const delimiter = detectDelimiter(clean)
  const lines = clean.trim().split('\n')
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
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

function stripBOM(text: string): string {
  return text.replace(/^\uFEFF/, '')
}

function normalizeHeader(header: string): string {
  const normalized = header.toLowerCase().trim().replace(/\s+/g, ' ')
  return COLUMN_ALIASES[normalized] ?? normalized
}

export function validateCSV(rows: string[][], carriers: Carrier[], defaultCarrierCode?: string): {
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

  const headers = rows[0].map(normalizeHeader)
  const trackingIdx = headers.indexOf('tracking_number')
  const carrierIdx = headers.indexOf('carrier_code')

  if (trackingIdx === -1) {
    errors.push({ row: 0, message: 'Colonna "tracking_number" mancante' })
    return { valid, errors }
  }
  const carrierMap = new Map(carriers.map(c => [c.code.toLowerCase(), c.id]))
  const defaultCarrierId = defaultCarrierCode ? carrierMap.get(defaultCarrierCode.toLowerCase()) : undefined

  if (carrierIdx === -1 && !defaultCarrierId) {
    errors.push({ row: 0, message: 'Colonna "carrier_code" mancante' })
    return { valid, errors }
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue

    const trackingNumber = row[trackingIdx]?.trim()
    const carrierCode = carrierIdx !== -1 ? row[carrierIdx]?.trim().toLowerCase() : defaultCarrierCode?.toLowerCase()

    if (!trackingNumber) {
      errors.push({ row: i + 1, message: 'Tracking number vuoto' })
      continue
    }
    if (!carrierCode) {
      errors.push({ row: i + 1, message: 'Codice corriere vuoto' })
      continue
    }

    const carrierId = carrierMap.get(carrierCode) ?? defaultCarrierId
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
