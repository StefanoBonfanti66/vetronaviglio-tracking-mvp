import type { CarrierTracker, CarrierTrackResult, CarrierTrackEvent } from './types.js'

function mapDhlStatus(statusCode: string): string {
  const map: Record<string, string> = {
    'pre-registered': 'pending',
    collected: 'picked_up',
    'picked up': 'picked_up',
    picked_up: 'picked_up',
    transit: 'in_transit',
    'in transit': 'in_transit',
    delivered: 'delivered',
    failed: 'exception',
    exception: 'exception',
    returned: 'returned',
  }
  return map[statusCode.toLowerCase()] || 'in_transit'
}

export class DhlTracker implements CarrierTracker {
  async track(trackingNumber: string): Promise<CarrierTrackResult> {
    const apiKey = process.env.DHL_API_KEY
    if (!apiKey) {
      throw new Error('DHL API key not configured')
    }

    const res = await fetch(
      `https://api-eu.dhl.com/track/shipments?trackingNumber=${encodeURIComponent(trackingNumber)}`,
      {
        headers: { 'DHL-API-Key': apiKey },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`DHL track failed: ${res.status} ${text}`)
    }

    const data: Record<string, any> = await res.json()
    const shipment = data.shipments?.[0]
    if (!shipment) {
      throw new Error(`No tracking data found for: ${trackingNumber}`)
    }

    const status = shipment.status
    const newStatus = mapDhlStatus(status?.statusCode || status?.status || '')

    const events: CarrierTrackEvent[] = (shipment.events || []).map((event: any) => ({
      status: mapDhlStatus(event.statusCode || event.status || ''),
      description: event.description || null,
      location: event.location?.address?.addressLocality || null,
      timestamp: event.timestamp || new Date().toISOString(),
      raw_event: event || null,
    }))

    return {
      tracking_number: trackingNumber,
      status: newStatus,
      status_description: status?.description || status?.status || null,
      estimated_delivery: shipment.estimatedTimeOfDelivery || null,
      actual_delivery: null,
      origin: shipment.origin?.address?.addressLocality || null,
      destination: shipment.destination?.address?.addressLocality || null,
      events,
      raw_payload: data,
    }
  }

  async trackMultiple(trackingNumbers: string[]): Promise<CarrierTrackResult[]> {
    const results: CarrierTrackResult[] = []
    for (const tn of trackingNumbers) {
      try {
        results.push(await this.track(tn))
      } catch {
        // skip failures
      }
    }
    return results
  }
}
