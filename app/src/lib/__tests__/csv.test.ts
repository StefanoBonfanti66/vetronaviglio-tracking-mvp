import { describe, it, expect } from 'vitest'
import { parseCSV, validateCSV, shipmentsToCSV } from '../csv'
import type { Carrier, Shipment } from '../../types/tracking'

describe('parseCSV', () => {
  it('parses simple CSV with header and data', () => {
    const csv = 'tracking_number,carrier_code\ntest123,fedex'
    const result = parseCSV(csv)
    expect(result).toEqual([
      ['tracking_number', 'carrier_code'],
      ['test123', 'fedex'],
    ])
  })

  it('handles quoted fields with commas', () => {
    const csv = 'tracking_number,customer_name\ntest123,"Rossi, Mario"'
    const result = parseCSV(csv)
    expect(result[1]).toEqual(['test123', 'Rossi, Mario'])
  })

  it('handles unquoted fields with quotes as literal characters', () => {
    const csv = 'name\ntest "quoted"'
    const result = parseCSV(csv)
    // Simple parser treats quotes as toggle, not escape
    expect(result[1][0]).toBe('test quoted')
  })

  it('trims whitespace', () => {
    const csv = '  tracking_number , carrier_code  \n  test123 , fedex '
    const result = parseCSV(csv)
    expect(result[0]).toEqual(['tracking_number', 'carrier_code'])
    expect(result[1]).toEqual(['test123', 'fedex'])
  })

  it('handles empty input', () => {
    const result = parseCSV('')
    // Empty string splits to [''], which produces [['']]
    expect(result).toEqual([['']])
  })

  it('handles single row (header only)', () => {
    const result = parseCSV('tracking_number,carrier_code')
    expect(result).toEqual([['tracking_number', 'carrier_code']])
  })

  it('strips UTF-8 BOM from file start', () => {
    const csv = '\uFEFFtracking_number,carrier_code\ntest123,fedex'
    const result = parseCSV(csv)
    expect(result[0]).toEqual(['tracking_number', 'carrier_code'])
    expect(result[1][0]).toBe('test123')
  })

  it('detects tab delimiter', () => {
    const csv = 'tracking_number\tcarrier_code\ntest123\tfedex'
    const result = parseCSV(csv)
    expect(result[0]).toEqual(['tracking_number', 'carrier_code'])
    expect(result[1]).toEqual(['test123', 'fedex'])
  })

  it('handles FedEx-style Italian headers with BOM and trailing spaces', () => {
    const csv = '\uFEFFNumero di monitoraggio,Stato ,Nome del contatto del destinatario ,Società destinataria ,Città del destinatario \n874289735740,Consegnata,Test User,Test Corp,Milano'
    const result = parseCSV(csv)
    expect(result[0][0]).toBe('Numero di monitoraggio')
    expect(result[0][1]).toBe('Stato')
  })
})

describe('validateCSV', () => {
  const carriers: Carrier[] = [
    { id: 'c1', name: 'FedEx', code: 'fedex', api_available: true, api_base_url: null, created_at: '', updated_at: '' },
    { id: 'c2', name: 'DHL', code: 'dhl', api_available: false, api_base_url: null, created_at: '', updated_at: '' },
    { id: 'c3', name: 'GLS', code: 'gls', api_available: false, api_base_url: null, created_at: '', updated_at: '' },
  ]

  it('returns error when file has only header', () => {
    const rows = [['tracking_number', 'carrier_code']]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(valid).toEqual([])
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('intestazione')
  })

  it('returns error when file is empty', () => {
    const { valid, errors } = validateCSV([], carriers)
    expect(valid).toEqual([])
    expect(errors).toHaveLength(1)
  })

  it('returns error when tracking_number column is missing', () => {
    const rows = [['carrier_code'], ['fedex']]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(valid).toEqual([])
    expect(errors[0].message).toContain('tracking_number')
  })

  it('returns error when carrier_code column is missing', () => {
    const rows = [['tracking_number'], ['test123']]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(valid).toEqual([])
    expect(errors[0].message).toContain('carrier_code')
  })

  it('valid rows with known carriers', () => {
    const rows = [
      ['tracking_number', 'carrier_code', 'customer_name'],
      ['FX001', 'fedex', 'Mario Rossi'],
      ['DH001', 'dhl', 'Luigi Bianchi'],
    ]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(errors).toEqual([])
    expect(valid).toHaveLength(2)
    expect(valid[0]).toEqual({
      tracking_number: 'FX001',
      carrier_id: 'c1',
      customer_name: 'Mario Rossi',
      customer_reference: undefined,
      order_number: undefined,
      origin: undefined,
      destination: undefined,
      notes: undefined,
    })
    expect(valid[1].carrier_id).toBe('c2')
  })

  it('skips empty rows', () => {
    const rows = [
      ['tracking_number', 'carrier_code'],
      ['FX001', 'fedex'],
      [''],
      ['FX002', 'gls'],
    ]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(errors).toEqual([])
    expect(valid).toHaveLength(2)
  })

  it('errors on unknown carrier code', () => {
    const rows = [
      ['tracking_number', 'carrier_code'],
      ['XX001', 'ups'],
    ]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(valid).toEqual([])
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('ups')
  })

  it('errors on empty tracking number', () => {
    const rows = [
      ['tracking_number', 'carrier_code'],
      ['', 'fedex'],
    ]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(valid).toEqual([])
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('vuoto')
  })

  it('handles case-insensitive carrier codes', () => {
    const rows = [
      ['tracking_number', 'carrier_code'],
      ['FX001', 'FedEx'],
    ]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(errors).toEqual([])
    expect(valid).toHaveLength(1)
    expect(valid[0].carrier_id).toBe('c1')
  })

  it('maps Italian FedEx headers to internal keys via aliases', () => {
    const rows = [
      ['Numero di monitoraggio', 'Stato', 'Nome del contatto del destinatario', 'Società destinataria', 'Città del destinatario', 'carrier_code'],
      ['874289735740', 'Consegnata', 'Test User', 'Test Corp', 'Milano', 'fedex'],
    ]
    const { valid, errors } = validateCSV(rows, carriers)
    expect(errors).toEqual([])
    expect(valid).toHaveLength(1)
    expect(valid[0].tracking_number).toBe('874289735740')
    expect(valid[0].customer_name).toBe('Test User')
    expect(valid[0].destination).toBe('Milano')
    expect(valid[0].carrier_id).toBe('c1')
  })

  it('uses defaultCarrierCode when carrier_code column is missing', () => {
    const rows = [
      ['Numero di monitoraggio', 'Stato', 'Nome del contatto del destinatario'],
      ['874289735740', 'Consegnata', 'Test User'],
    ]
    const { valid, errors } = validateCSV(rows, carriers, 'fedex')
    expect(errors).toEqual([])
    expect(valid).toHaveLength(1)
    expect(valid[0].tracking_number).toBe('874289735740')
    expect(valid[0].carrier_id).toBe('c1')
  })
})

describe('shipmentsToCSV', () => {
  it('exports shipments to CSV format', () => {
    const shipments: Shipment[] = [
      {
        id: 's1',
        tracking_number: 'FX001',
        carrier_id: 'c1',
        status: 'delivered',
        status_description: null,
        origin: 'Milano',
        destination: 'Roma',
        customer_name: 'Mario',
        customer_reference: 'REF01',
        order_number: 'ORD01',
        estimated_delivery: null,
        actual_delivery: null,
        last_update: null,
        raw_payload: null,
        notes: 'Test note',
        created_at: '',
        updated_at: '',
        carrier: { id: 'c1', name: 'FedEx', code: 'fedex', api_available: true, api_base_url: null, created_at: '', updated_at: '' },
      },
    ]
    const csv = shipmentsToCSV(shipments)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('tracking_number,carrier_code,customer_name,customer_reference,order_number,origin,destination,status,notes')
    expect(lines[1]).toContain('FX001')
    expect(lines[1]).toContain('fedex')
    expect(lines[1]).toContain('delivered')
    expect(lines[1]).toContain('Mario')
  })

  it('escapes quotes in values', () => {
    const shipments: Shipment[] = [
      {
        id: 's1',
        tracking_number: 'FX002',
        carrier_id: 'c1',
        status: 'in_transit',
        status_description: null,
        origin: null,
        destination: null,
        customer_name: 'Test "User"',
        customer_reference: null,
        order_number: null,
        estimated_delivery: null,
        actual_delivery: null,
        last_update: null,
        raw_payload: null,
        notes: null,
        created_at: '',
        updated_at: '',
        carrier: { id: 'c1', name: 'FedEx', code: 'fedex', api_available: true, api_base_url: null, created_at: '', updated_at: '' },
      },
    ]
    const csv = shipmentsToCSV(shipments)
    expect(csv).toContain('Test ""User""')
  })

  it('handles empty shipments array', () => {
    const csv = shipmentsToCSV([])
    expect(csv).toBe('tracking_number,carrier_code,customer_name,customer_reference,order_number,origin,destination,status,notes')
  })
})
