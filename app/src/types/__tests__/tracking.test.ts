import { describe, it, expect } from 'vitest'
import { STATUS_LABELS, STATUS_COLORS } from '../tracking'
import type { ShipmentStatus } from '../tracking'

describe('STATUS_LABELS', () => {
  it('has labels for all 7 shipment statuses', () => {
    const statuses: ShipmentStatus[] = [
      'pending', 'picked_up', 'in_transit', 'out_for_delivery',
      'delivered', 'exception', 'returned',
    ]
    for (const status of statuses) {
      expect(STATUS_LABELS[status]).toBeTruthy()
      expect(typeof STATUS_LABELS[status]).toBe('string')
    }
  })

  it('labels are in Italian', () => {
    expect(STATUS_LABELS.pending).toBe('In attesa')
    expect(STATUS_LABELS.delivered).toBe('Consegnato')
    expect(STATUS_LABELS.exception).toBe('Eccezione')
  })
})

describe('STATUS_COLORS', () => {
  it('has colors for all 7 shipment statuses', () => {
    const statuses: ShipmentStatus[] = [
      'pending', 'picked_up', 'in_transit', 'out_for_delivery',
      'delivered', 'exception', 'returned',
    ]
    for (const status of statuses) {
      expect(STATUS_COLORS[status]).toBeTruthy()
      expect(STATUS_COLORS[status]).toContain('bg-')
      expect(STATUS_COLORS[status]).toContain('text-')
    }
  })
})
