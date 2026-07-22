import type { FedExTrackResult } from '../types/fedex'
import type { ShipmentStatus } from '../types/tracking'

// Browser-side FedEx client — calls our Vercel serverless API proxy
// to avoid CORS issues with FedEx API
export class FedExClient {
  private apiBase: string

  constructor() {
    this.apiBase = '/api/fedex'
  }

  async track(trackingNumber: string): Promise<FedExTrackResult> {
    const response = await fetch(`${this.apiBase}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `FedEx tracking failed: ${response.status}`)
    }

    const data = await response.json()
    const results = data.output?.completeTrackResults?.[0]?.trackResults
    if (!results || results.length === 0) {
      throw new Error(`No tracking data found for: ${trackingNumber}`)
    }

    return results[0]
  }

  async trackMultiple(trackingNumbers: string[]): Promise<FedExTrackResult[]> {
    const results: FedExTrackResult[] = []
    // FedEx API doesn't support batch via our proxy — track one by one
    for (const tn of trackingNumbers) {
      try {
        const result = await this.track(tn)
        results.push(result)
      } catch {
        // Skip failed tracking numbers in batch
      }
    }
    return results
  }
}

// Map FedEx status to our shipment status
export function mapFedExStatus(fedexStatus: string): ShipmentStatus {
  const statusMap: Record<string, ShipmentStatus> = {
    'OC': 'pending',
    'PU': 'picked_up',
    'IT': 'in_transit',
    'OD': 'out_for_delivery',
    'DL': 'delivered',
    'SE': 'exception',
    'CA': 'returned',
    'DE': 'exception',
  }

  return statusMap[fedexStatus] || 'in_transit'
}

export function getFedExClient(): FedExClient | null {
  // Check if FedEx is configured — in the browser we only check for the API key
  // The actual secrets are on the server side (Vercel env vars without VITE_ prefix)
  const apiKey = import.meta.env.VITE_FEDEX_API_KEY
  if (!apiKey) {
    return null
  }

  return new FedExClient()
}
