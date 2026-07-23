export type CarrierTrackEvent = {
  status: string
  description: string | null
  location: string | null
  timestamp: string
  raw_event: Record<string, unknown> | null
}

export type CarrierTrackResult = {
  tracking_number: string
  status: string
  status_description: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  origin: string | null
  destination: string | null
  events: CarrierTrackEvent[]
  raw_payload: Record<string, unknown>
}

export interface CarrierTracker {
  track(trackingNumber: string): Promise<CarrierTrackResult>
  trackMultiple(trackingNumbers: string[]): Promise<CarrierTrackResult[]>
}
