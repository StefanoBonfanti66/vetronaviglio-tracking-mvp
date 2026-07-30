import type { CarrierTracker } from './types.js'
import { FedExTracker } from './FedExTracker.js'
import { DhlTracker } from './DhlTracker.js'

const trackerRegistry: Record<string, (carrierId?: string) => CarrierTracker> = {
  fedex: (carrierId?: string) => new FedExTracker(carrierId),
  dhl: (carrierId?: string) => new DhlTracker(carrierId),
}

export function getTracker(carrierCode: string, carrierId?: string): CarrierTracker {
  const factory = trackerRegistry[carrierCode.toLowerCase()]
  if (!factory) {
    throw new Error(`No tracker available for carrier: ${carrierCode}`)
  }
  return factory(carrierId)
}

export function getSupportedCarrierCodes(): string[] {
  return Object.keys(trackerRegistry)
}
