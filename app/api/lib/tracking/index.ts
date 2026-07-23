import type { CarrierTracker } from './types'
import { FedExTracker } from './FedExTracker'
import { DhlTracker } from './DhlTracker'

const trackerRegistry: Record<string, () => CarrierTracker> = {
  fedex: () => new FedExTracker(),
  dhl: () => new DhlTracker(),
}

export function getTracker(carrierCode: string): CarrierTracker {
  const factory = trackerRegistry[carrierCode.toLowerCase()]
  if (!factory) {
    throw new Error(`No tracker available for carrier: ${carrierCode}`)
  }
  return factory()
}

export function getSupportedCarrierCodes(): string[] {
  return Object.keys(trackerRegistry)
}
