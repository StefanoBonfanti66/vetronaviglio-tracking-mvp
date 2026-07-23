import { describe, it, expect } from 'vitest'
import { mapFedExStatus } from '../tracking/statusMaps'

describe('mapFedExStatus', () => {
  it('maps OC to pending', () => {
    expect(mapFedExStatus('OC')).toBe('pending')
  })

  it('maps PU to picked_up', () => {
    expect(mapFedExStatus('PU')).toBe('picked_up')
  })

  it('maps IT to in_transit', () => {
    expect(mapFedExStatus('IT')).toBe('in_transit')
  })

  it('maps OD to out_for_delivery', () => {
    expect(mapFedExStatus('OD')).toBe('out_for_delivery')
  })

  it('maps DL to delivered', () => {
    expect(mapFedExStatus('DL')).toBe('delivered')
  })

  it('maps SE to exception', () => {
    expect(mapFedExStatus('SE')).toBe('exception')
  })

  it('maps CA to returned', () => {
    expect(mapFedExStatus('CA')).toBe('returned')
  })

  it('maps DE to exception', () => {
    expect(mapFedExStatus('DE')).toBe('exception')
  })

  it('returns in_transit for unknown status', () => {
    expect(mapFedExStatus('XX')).toBe('in_transit')
  })

  it('returns in_transit for empty string', () => {
    expect(mapFedExStatus('')).toBe('in_transit')
  })
})
