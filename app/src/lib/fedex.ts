import type {
  FedExConfig,
  FedExAuthResponse,
  FedExTrackRequest,
  FedExTrackResponse,
  FedExTrackResult,
} from '../types/fedex'
import type { ShipmentStatus } from '../types/tracking'

// FedEx API client
export class FedExClient {
  private config: FedExConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: FedExConfig) {
    this.config = config
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return
    }

    const credentials = btoa(`${this.config.apiKey}:${this.config.secretKey}`)

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error(`FedEx authentication failed: ${response.status}`)
    }

    const data: FedExAuthResponse = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // Refresh 1 min before expiry
  }

  async track(trackingNumber: string): Promise<FedExTrackResult> {
    await this.authenticate()

    const request: FedExTrackRequest = {
      includeDetailedScans: true,
      trackingInfo: [
        {
          trackingNumberInfo: {
            trackingNumber,
          },
        },
      ],
    }

    const response = await fetch(`${this.config.baseUrl}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'X-locale': 'it_IT',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`FedEx tracking failed: ${response.status}`)
    }

    const data: FedExTrackResponse = await response.json()
    const results = data.output.completeTrackResults[0]?.trackResults
    if (!results || results.length === 0) {
      throw new Error(`No tracking data found for: ${trackingNumber}`)
    }

    return results[0]
  }

  async trackMultiple(trackingNumbers: string[]): Promise<FedExTrackResult[]> {
    await this.authenticate()

    const request: FedExTrackRequest = {
      includeDetailedScans: true,
      trackingInfo: trackingNumbers.map((number) => ({
        trackingNumberInfo: {
          trackingNumber: number,
        },
      })),
    }

    const response = await fetch(`${this.config.baseUrl}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'X-locale': 'it_IT',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`FedEx batch tracking failed: ${response.status}`)
    }

    const data: FedExTrackResponse = await response.json()
    const trackResults = data.output.completeTrackResults[0]?.trackResults
    return trackResults || []
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

// Get FedEx client from environment variables
// Convenience function for tracking a single shipment
export async function trackFedExShipment(trackingNumber: string) {
  const client = getFedExClient()
  if (!client) {
    throw new Error('FedEx client not configured')
  }
  return client.track(trackingNumber)
}

export function getFedExClient(): FedExClient | null {
  const apiKey = import.meta.env.VITE_FEDEX_API_KEY
  const secretKey = import.meta.env.VITE_FEDEX_SECRET_KEY
  const baseUrl = import.meta.env.VITE_FEDEX_BASE_URL
  const customerCode = import.meta.env.VITE_FEDEX_CUSTOMER_CODE

  if (!apiKey || !secretKey || !baseUrl || !customerCode) {
    return null
  }

  return new FedExClient({
    apiKey,
    secretKey,
    baseUrl,
    customerCode,
  })
}
