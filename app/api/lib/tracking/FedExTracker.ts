import type { CarrierTracker, CarrierTrackResult, CarrierTrackEvent } from './types.js'

function mapFedExStatus(code: string): string {
  const map: Record<string, string> = {
    OC: 'pending',
    PU: 'picked_up',
    IT: 'in_transit',
    OD: 'out_for_delivery',
    DL: 'delivered',
    SE: 'exception',
    CA: 'returned',
    DE: 'exception',
  }
  return map[code] || 'in_transit'
}

export class FedExTracker implements CarrierTracker {
  private token: string | null = null
  private tokenExpiry = 0

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) return this.token

    const apiKey = process.env.FEDEX_API_KEY
    const secretKey = process.env.FEDEX_SECRET_KEY
    const baseUrl = process.env.FEDEX_BASE_URL
    if (!apiKey || !secretKey || !baseUrl) {
      throw new Error('FedEx credentials not configured')
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey,
    })

    const res = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`FedEx auth failed: ${res.status} ${text}`)
    }

    const data = await res.json()
    this.token = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return this.token!
  }

  async track(trackingNumber: string): Promise<CarrierTrackResult> {
    const token = await this.getToken()
    const baseUrl = process.env.FEDEX_BASE_URL!

    const res = await fetch(`${baseUrl}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-locale': 'it_IT',
      },
      body: JSON.stringify({
        includeDetailedScans: true,
        trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`FedEx track failed: ${res.status} ${text}`)
    }

    const data: Record<string, any> = await res.json()
    const results = data.output?.completeTrackResults?.[0]?.trackResults
    if (!results?.length) {
      throw new Error(`No tracking data found for: ${trackingNumber}`)
    }

    const result = results[0]
    const latestStatus = result.latestStatusDetail
    const derivedCode = latestStatus?.derivedCode || latestStatus?.code || ''
    const newStatus = mapFedExStatus(derivedCode)

    const events: CarrierTrackEvent[] = (result.scanEvents || []).map((event: any) => {
      const evtLoc = event.scanLocation
      const evtLocStr = evtLoc
        ? [evtLoc.city, evtLoc.stateOrProvinceCode, evtLoc.countryCode].filter(Boolean).join(', ')
        : null
      return {
        status: mapFedExStatus(event.derivedCode || event.code || ''),
        description: event.eventDescription || null,
        location: evtLocStr,
        timestamp: event.date || new Date().toISOString(),
        raw_event: event || null,
      }
    })

    return {
      tracking_number: trackingNumber,
      status: newStatus,
      status_description: latestStatus?.description || null,
      estimated_delivery: null,
      actual_delivery: null,
      origin: null,
      destination: null,
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
