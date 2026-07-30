import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const FEDEX_CARRIER_CODE = 'fedex'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' })
  }

  const startTime = Date.now()

  const { cookies, accessToken } = req.body || {}
  const fedexCookies = cookies || process.env.FEDEX_SESSION_COOKIES
  const fedexToken = accessToken || process.env.FEDEX_ACCESS_TOKEN

  if (!fedexCookies) {
    return res.status(400).json({ error: 'FedEx session cookies required — run discover-fedex script first' })
  }

  const supabaseHeaders = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    const token = fedexToken || process.env.FEDEX_ACCESS_TOKEN

    const fedexRes = await fetch('https://api.fedex.com/track/v2/shipments/visibilitieslist', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'x-clientid': 'WTRK',
        'x-version': '1.0.0',
        'x-locale': 'en_US',
        'x-requested-with': 'XMLHttpRequest',
        'content-type': 'application/json',
        cookie: fedexCookies,
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
        return res.status(401).json({ error: 'FedEx session expired — run discover-fedex script to re-login', duration_ms: Date.now() - startTime })
      }
      return res.status(502).json({ error: `FedEx API error: ${text}`, duration_ms: Date.now() - startTime })
    }

    const fedexData = await fedexRes.json() as {
      output?: {
        totalNumberOfShipments?: number
        shipmentLightInfo?: Array<{
          trkNbr: string
          carrCD: string
          keyStat: string
          statWithDet: string
        }>
      }
    }

    const total = fedexData.output?.totalNumberOfShipments ?? 0
    const shipmentList = fedexData.output?.shipmentLightInfo ?? []

    if (!shipmentList.length) {
      return res.status(200).json({
        message: 'No shipments from FedEx',
        fedex_count: total,
        imported: 0,
        duration_ms: Date.now() - startTime,
      })
    }

    const fedexTrackings = shipmentList.map(s => s.trkNbr)

    const [carriersRes, existingRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/carriers?select=id&code=eq.${FEDEX_CARRIER_CODE}`, { headers: supabaseHeaders }),
      fetch(`${SUPABASE_URL}/rest/v1/shipments?select=tracking_number`, { headers: supabaseHeaders }),
    ])

    if (!carriersRes.ok || !existingRes.ok) {
      return res.status(502).json({ error: 'Supabase query failed', duration_ms: Date.now() - startTime })
    }

    const carriers = await carriersRes.json() as Array<{ id: string }>
    const existingShipments = await existingRes.json() as Array<{ tracking_number: string }>

    if (!carriers.length) {
      return res.status(500).json({ error: `Carrier '${FEDEX_CARRIER_CODE}' not found in Supabase`, duration_ms: Date.now() - startTime })
    }

    const fedexCarrierId = carriers[0].id
    const existingSet = new Set(existingShipments.map(s => s.tracking_number))

    const shipmentMap = new Map(shipmentList.map(s => [s.trkNbr, s]))

    const newTrackings = fedexTrackings.filter(t => !existingSet.has(t))
    const errors: string[] = []

    if (newTrackings.length > 0) {
      const newRecords = newTrackings.map(t => {
        const info = shipmentMap.get(t)!
        const dest = info.statWithDet?.split(';').pop()?.trim() || null
        return {
          tracking_number: t,
          carrier_id: fedexCarrierId,
          status: 'pending',
          status_description: info.keyStat || null,
          destination: dest,
          last_update: new Date().toISOString(),
        }
      })

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/shipments`, {
        method: 'POST',
        headers: { ...supabaseHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify(newRecords),
      })

      if (!insertRes.ok) {
        const errText = await insertRes.text()
        errors.push(`Insert failed: ${errText}`)
      }
    }

    const carrierTotals: Record<string, { fedex_count: number; supabase_before: number; supabase_after: number }> = {
      fedex: {
        fedex_count: total,
        supabase_before: existingSet.size,
        supabase_after: existingSet.size + newTrackings.length,
      },
    }

    return res.status(200).json({
      message: newTrackings.length > 0
        ? `Importate ${newTrackings.length} nuove spedizioni da FedEx`
        : 'Nessuna nuova spedizione — FedEx e Supabase sincronizzati',
      fedex_count: total,
      supabase_before: existingSet.size,
      imported: newTrackings.length,
      duplicates: fedexTrackings.length - newTrackings.length,
      errors,
      carrier_totals: carrierTotals,
      duration_ms: Date.now() - startTime,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal error',
      duration_ms: Date.now() - startTime,
    })
  }
}
