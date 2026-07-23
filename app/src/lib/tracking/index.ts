import type { CarrierTrackResult } from './types'

export async function trackShipment(carrierCode: string, trackingNumber: string): Promise<CarrierTrackResult> {
  const res = await fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carrier: carrierCode, trackingNumber }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Tracking failed: ${res.status}`)
  }

  return res.json()
}
