export type FedExConfig = {
  apiKey: string
  secretKey: string
  baseUrl: string
  customerCode: string
}

export type FedExAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type FedExTrackRequest = {
  includeDetailedScans: boolean
  trackingInfo: Array<{
    trackingNumberInfo: {
      trackingNumber: string
    }
  }>
}

export type FedExTrackEvent = {
  eventClass: string
  eventType: string
  eventDescription: string
  date: string
  status: string
  scannerDetail: string[]
  scanLocation: {
    streetLines: string[]
    city: string
    stateOrProvinceCode: string
    countryCode: string
    postalCode: string
  }
}

export type FedExTrackResult = {
  trackingNumber: string
  trackResult: {
    trackingNumberInfo: {
      trackingNumber: string
      carrierCode: string
    }
    latestStatusDetail: {
      date: string
      eventType: string
      eventDescription: string
      status: string
      scanLocation: {
        streetLines: string[]
        city: string
        stateOrProvinceCode: string
        countryCode: string
        postalCode: string
      }
    }
    scanEvents: FedExTrackEvent[]
    additionalTrackingInfo: {
      packageIdentifiers: Array<{
        type: string
        values: string[]
      }>
    }
  }
}

export type FedExTrackResponse = {
  transactionId: string
  output: {
    completeTrackResults: Array<{
      trackResults: FedExTrackResult[]
    }>
  }
}
