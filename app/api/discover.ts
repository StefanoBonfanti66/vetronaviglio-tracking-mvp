import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCarrierCredentials } from './lib/credentials.js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface DhlShipment {
  airWayBill: string
  logicalCategory: string
  status: string
  shippingDate: string
  description: string
  fromContact: { company?: string }
  toContact: { company?: string; city?: string; countryCode?: string }
}

interface DhlSearchResponse {
  shipments: DhlShipment[]
  page: { totalElements: number }
}

async function discoverFedex(cookies: string, accessToken: string | undefined, supabaseUrl: string, supabaseHeaders: Record<string, string>, startTime: number): Promise<DiscoverResult> {
  const token = accessToken || process.env.FEDEX_ACCESS_TOKEN

  const fedexRes = await fetch('https://api.fedex.com/track/v2/shipments/visibilitieslist', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'x-clientid': 'WTRK',
      'x-version': '1.0.0',
      'x-locale': 'en_US',
      'x-requested-with': 'XMLHttpRequest',
      'content-type': 'application/json',
      cookie: cookies,
    },
    body: JSON.stringify({
      appDeviceType: 'WTRK',
      appType: 'WTRK',
      pageSize: '500',
      pageToken: '1',
      sort: 'EDD',
      dvx_Customer: 'true',
      uniqueKey: '',
      updatedSinceTs: '',
      processingParameters: {},
    }),
  })

  if (!fedexRes.ok) {
    const text = await fedexRes.text()
    if (fedexRes.status === 401 || text.includes('USER.RELOGIN.REQUIRED')) {
      return { error: 'FedEx session expired — run discover-fedex script to re-login', duration_ms: Date.now() - startTime, status: 401 }
    }
    return { error: `FedEx API error: ${text}`, duration_ms: Date.now() - startTime, status: 502 }
  }

  const fedexData = await fedexRes.json() as {
    output?: { totalNumberOfShipments?: number; shipmentLightInfo?: Array<{ trkNbr: string; carrCD: string; keyStat: string; statWithDet: string }> }
  }

  const total = fedexData.output?.totalNumberOfShipments ?? 0
  const shipmentList = fedexData.output?.shipmentLightInfo ?? []

  if (!shipmentList.length) {
    return { fedex_count: total, imported: 0, duration_ms: Date.now() - startTime, status: 200 }
  }

  return importShipments(shipmentList.map(s => ({
    trackingNumber: s.trkNbr,
    statusDescription: s.keyStat,
    destination: s.statWithDet?.split(';').pop()?.trim() || null,
  })), 'fedex', supabaseUrl, supabaseHeaders, startTime, total)
}

async function discoverDhl(cookies: string, xsrfToken: string, supabaseUrl: string, supabaseHeaders: Record<string, string>, startTime: number): Promise<DiscoverResult> {
  const dhlRes = await fetch('https://mydhl.express.dhl/api/mms/search', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-xsrf-token': xsrfToken,
      'x-requested-with': 'XMLHttpRequest',
      cookie: cookies,
      referer: 'https://mydhl.express.dhl/it/it/home.html',
    },
    body: JSON.stringify({
      page: { pageNumber: 0, pageSize: 500 },
      statusFilters: [],
      dateFilter: { type: 'ALL' },
      myShipmentViewMode: 'MY_SHIPMENTS',
      shipmentVisibility: 'SHOW_VISIBLE_ONLY',
    }),
  })

  if (!dhlRes.ok) {
    const text = await dhlRes.text()
    if (dhlRes.status === 401) {
      return { error: 'DHL session expired — run discover-dhl script to re-login', duration_ms: Date.now() - startTime, status: 401 }
    }
    return { error: `DHL API error: ${text}`, duration_ms: Date.now() - startTime, status: 502 }
  }

  const data = await dhlRes.json() as DhlSearchResponse
  const total = data.page?.totalElements ?? 0
  const allShipments = data.shipments ?? []

  const valid = allShipments.filter(s => {
    if (!s.airWayBill) return false
    if (s.airWayBill.endsWith('_FAV')) return false
    return true
  })

  if (!valid.length) {
    return { dhl_count: total, imported: 0, duration_ms: Date.now() - startTime, status: 200 }
  }

  return importShipments(valid.map(s => ({
    trackingNumber: s.airWayBill,
    statusDescription: s.status || s.logicalCategory || null,
    destination: s.toContact ? [s.toContact.city, s.toContact.countryCode].filter(Boolean).join(', ') || null : null,
  })), 'dhl', supabaseUrl, supabaseHeaders, startTime, total)
}

interface DiscoverResult {
  status: number
  duration_ms: number
  imported?: number
  [key: string]: unknown
}

function supabaseHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_SERVICE_KEY!,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
    'Content-Type': 'application/json',
  }
}

async function getCarrierIdByCode(code: string, supabaseUrl: string, headers: Record<string, string>): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/rest/v1/carriers?code=eq.${code}&select=id`, { headers })
  if (!res.ok) return null
  const rows = await res.json() as Array<{ id: string }>
  return rows[0]?.id ?? null
}

async function upsertCredential(carrierId: string, key: string, value: string, supabaseUrl: string, headers: Record<string, string>): Promise<void> {
  if (!value) return
  const exists = await fetch(
    `${supabaseUrl}/rest/v1/carrier_credentials?carrier_id=eq.${carrierId}&credential_key=eq.${key}&select=id`,
    { headers },
  ).then(r => r.json())

  if (exists?.length > 0) {
    await fetch(
      `${supabaseUrl}/rest/v1/carrier_credentials?carrier_id=eq.${carrierId}&credential_key=eq.${key}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential_value: value }),
      },
    )
  } else {
    await fetch(
      `${supabaseUrl}/rest/v1/carrier_credentials`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ carrier_id: carrierId, credential_key: key, credential_value: value }),
      },
    )
  }
}

async function importShipments(
  items: Array<{ trackingNumber: string; statusDescription: string | null; destination: string | null }>,
  carrierCode: string,
  supabaseUrl: string,
  supabaseHeaders: Record<string, string>,
  startTime: number,
  totalFromApi: number,
): Promise<DiscoverResult> {
  const [carriersRes, existingRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/carriers?select=id&code=eq.${carrierCode}`, { headers: supabaseHeaders }),
    fetch(`${supabaseUrl}/rest/v1/shipments?select=tracking_number`, { headers: supabaseHeaders }),
  ])

  if (!carriersRes.ok || !existingRes.ok) {
    return { error: 'Supabase query failed', duration_ms: Date.now() - startTime, status: 502 }
  }

  const carriers = await carriersRes.json() as Array<{ id: string }>
  const existingShipments = await existingRes.json() as Array<{ tracking_number: string }>

  if (!carriers.length) {
    return { error: `Carrier '${carrierCode}' not found in Supabase`, duration_ms: Date.now() - startTime, status: 500 }
  }

  const carrierId = carriers[0].id
  const existingSet = new Set(existingShipments.map(s => s.tracking_number))

  const newItems = items.filter(i => !existingSet.has(i.trackingNumber))
  const errors: string[] = []

  if (newItems.length > 0) {
    const newRecords = newItems.map(i => ({
      tracking_number: i.trackingNumber,
      carrier_id: carrierId,
      status: 'pending',
      status_description: i.statusDescription,
      destination: i.destination,
      last_update: new Date().toISOString(),
    }))

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/shipments`, {
      method: 'POST',
      headers: { ...supabaseHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify(newRecords),
    })

    if (!insertRes.ok) {
      const errText = await insertRes.text()
      errors.push(`Insert failed: ${errText}`)
    }
  }

  return {
    [carrierCode]: {
      api_count: totalFromApi,
      supabase_before: existingSet.size,
      supabase_after: existingSet.size + newItems.length,
    },
    imported: newItems.length,
    duplicates: items.length - newItems.length,
    errors,
    duration_ms: Date.now() - startTime,
    status: 200,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' })
  }

  const startTime = Date.now()
  const CRON_SECRET = process.env.CRON_SECRET

  if (req.method === 'GET') {
    const auth = req.headers.authorization
    if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const fedexCarrierId = await getCarrierIdByCode('fedex', SUPABASE_URL, supabaseHeaders())
    const fedexCreds = fedexCarrierId ? await getCarrierCredentials(fedexCarrierId) : {}
    const result = await discoverFedex(
      process.env.FEDEX_SESSION_COOKIES || fedexCreds.FEDEX_SESSION_COOKIES || '',
      process.env.FEDEX_ACCESS_TOKEN || fedexCreds.FEDEX_ACCESS_TOKEN,
      SUPABASE_URL,
      supabaseHeaders(),
      startTime,
    )
    return res.status(result.status).json({
      message: (result.imported ?? 0) > 0
        ? `Importate ${result.imported ?? 0} nuove spedizioni da FedEx`
        : 'Nessuna nuova spedizione — FedEx e Supabase sincronizzati',
      ...result,
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { carrier = 'fedex', cookies, accessToken, xsrfToken, trackingNumbers } = req.body || {}

  const fedexCarrierId = await getCarrierIdByCode('fedex', SUPABASE_URL, supabaseHeaders())
  const fedexCreds = fedexCarrierId ? await getCarrierCredentials(fedexCarrierId) : {}

  try {
    if (carrier === 'dhl') {
      const dhlTrackingNumbers = Array.isArray(trackingNumbers)
        ? trackingNumbers
        : typeof trackingNumbers === 'string'
          ? trackingNumbers.split(',').map(t => t.trim()).filter(Boolean)
          : []

      if (dhlTrackingNumbers.length > 0) {
        const result = await importShipments(
          dhlTrackingNumbers.map(awb => ({
            trackingNumber: awb,
            statusDescription: 'DHL discovery (browser)',
            destination: null,
          })),
          'dhl',
          SUPABASE_URL,
          supabaseHeaders(),
          startTime,
          dhlTrackingNumbers.length,
        )
        return res.status(result.status).json({
          message: (result.imported ?? 0) > 0
            ? `Importate ${result.imported ?? 0} nuove spedizioni DHL`
            : 'Nessuna nuova spedizione DHL',
          ...result,
        })
      }

      const dhlCarrierId = await getCarrierIdByCode('dhl', SUPABASE_URL, supabaseHeaders())
      const dhlCreds = dhlCarrierId ? await getCarrierCredentials(dhlCarrierId) : {}
      const dhlCookies = cookies || dhlCreds.DHL_SESSION_COOKIES
      const dhlXsrf = xsrfToken || dhlCreds.DHL_XSRF_TOKEN
      if (!dhlCookies || !dhlXsrf) {
        return res.status(400).json({ error: 'DHL session cookies and XSRF token required — run discover-dhl script first' })
      }
      const result = await discoverDhl(dhlCookies, dhlXsrf, SUPABASE_URL, supabaseHeaders(), startTime)
      if (dhlCarrierId) {
        await upsertCredential(dhlCarrierId, 'DHL_SESSION_COOKIES', cookies, SUPABASE_URL, supabaseHeaders())
        await upsertCredential(dhlCarrierId, 'DHL_XSRF_TOKEN', xsrfToken, SUPABASE_URL, supabaseHeaders())
      }
      return res.status(result.status).json({
        message: (result.imported ?? 0) > 0
          ? `Importate ${result.imported ?? 0} nuove spedizioni DHL`
          : 'Nessuna nuova spedizione DHL',
        ...result,
      })
    }

    const fedexCookies = cookies || fedexCreds.FEDEX_SESSION_COOKIES || process.env.FEDEX_SESSION_COOKIES
    if (!fedexCookies) {
      return res.status(400).json({ error: 'FedEx session cookies required — run discover-fedex script first' })
    }
    const result = await discoverFedex(
      fedexCookies,
      accessToken || fedexCreds.FEDEX_ACCESS_TOKEN,
      SUPABASE_URL,
      supabaseHeaders(),
      startTime,
    )
    if (fedexCarrierId) {
      await upsertCredential(fedexCarrierId, 'FEDEX_SESSION_COOKIES', cookies, SUPABASE_URL, supabaseHeaders())
      await upsertCredential(fedexCarrierId, 'FEDEX_ACCESS_TOKEN', accessToken, SUPABASE_URL, supabaseHeaders())
    }
    return res.status(result.status).json({
      message: (result.imported ?? 0) > 0
        ? `Importate ${result.imported ?? 0} nuove spedizioni da FedEx`
        : 'Nessuna nuova spedizione — FedEx e Supabase sincronizzati',
      ...result,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal error',
      duration_ms: Date.now() - startTime,
    })
  }
}
