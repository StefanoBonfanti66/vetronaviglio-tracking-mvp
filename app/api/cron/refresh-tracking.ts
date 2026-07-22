import type { VercelRequest, VercelResponse } from '@vercel/node'

// Cron job: auto-refresh FedEx tracking statuses
// Called by Vercel Cron every 30 minutes
// Uses service_role key to bypass RLS

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FEDEX_API_KEY = process.env.FEDEX_API_KEY
const FEDEX_SECRET_KEY = process.env.FEDEX_SECRET_KEY
const FEDEX_BASE_URL = process.env.FEDEX_BASE_URL
const CRON_SECRET = process.env.CRON_SECRET

// FedEx status code → internal status mapping
function mapFedExStatus(code: string): string {
  const map: Record<string, string> = {
    'OC': 'pending',
    'PU': 'picked_up',
    'IT': 'in_transit',
    'OD': 'out_for_delivery',
    'DL': 'delivered',
    'SE': 'exception',
    'CA': 'returned',
    'DE': 'exception',
  }
  return map[code] || 'in_transit'
}

// Statuses that should be refreshed (not terminal)
const ACTIVE_STATUSES = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'exception']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET = Vercel Cron, POST = manual refresh from browser
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify cron secret for automated calls (GET); manual POST from browser skips this
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' })
  }

  if (!FEDEX_API_KEY || !FEDEX_SECRET_KEY || !FEDEX_BASE_URL) {
    return res.status(500).json({ error: 'FedEx credentials not configured' })
  }

  const startTime = Date.now()
  const results = { updated: 0, unchanged: 0, errors: 0, skipped: 0, total: 0 }

  try {
    // 1. Get FedEx carrier ID
    const carriersRes = await fetch(`${SUPABASE_URL}/rest/v1/carriers?code=eq.fedex&select=id`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })
    const carriers = await carriersRes.json()
    if (!carriers.length) {
      return res.status(500).json({ error: 'FedEx carrier not found in database' })
    }
    const fedexCarrierId = carriers[0].id

    // 2. Get active FedEx shipments
    const shipmentsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/shipments?carrier_id=eq.${fedexCarrierId}&status=in.(${ACTIVE_STATUSES.join(',')})&select=id,tracking_number,status,status_description`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )
    const shipments = await shipmentsRes.json()

    if (!shipments.length) {
      return res.status(200).json({
        message: 'No active FedEx shipments to refresh',
        results,
        duration_ms: Date.now() - startTime,
      })
    }

    results.total = shipments.length

    // 3. Get FedEx OAuth token (one token for all requests)
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: FEDEX_API_KEY,
      client_secret: FEDEX_SECRET_KEY,
    })
    const tokenRes = await fetch(`${FEDEX_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      return res.status(500).json({ error: `FedEx auth failed: ${tokenRes.status}`, detail: errText })
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 4. Track each shipment
    for (const shipment of shipments) {
      try {
        const trackRes = await fetch(`${FEDEX_BASE_URL}/track/v1/trackingnumbers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'X-locale': 'it_IT',
          },
          body: JSON.stringify({
            includeDetailedScans: false,
            trackingInfo: [{
              trackingNumberInfo: { trackingNumber: shipment.tracking_number },
            }],
          }),
        })

        if (!trackRes.ok) {
          results.errors++
          continue
        }

        const trackData = await trackRes.json()
        const trackResults = trackData.output?.completeTrackResults?.[0]?.trackResults
        if (!trackResults?.length) {
          results.skipped++
          continue
        }

        const result = trackResults[0]
        const newStatus = mapFedExStatus(result.latestStatusDetail?.derivedCode || result.latestStatusDetail?.code || '')
        const newDescription = result.latestStatusDetail?.description || null

        // Only update if status changed or description changed
        if (newStatus === shipment.status && newDescription === shipment.status_description) {
          results.unchanged++
          continue
        }

        // Update shipment status
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/shipments?id=eq.${shipment.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            status: newStatus,
            status_description: newDescription,
            last_update: new Date().toISOString(),
          }),
        })

        if (!updateRes.ok) {
          results.errors++
          continue
        }

        // Insert tracking event
        const location = result.latestStatusDetail?.scanLocation
        const locationStr = location
          ? [location.city, location.stateOrProvinceCode, location.countryCode].filter(Boolean).join(', ')
          : null

        await fetch(`${SUPABASE_URL}/rest/v1/tracking_events`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            shipment_id: shipment.id,
            status: newStatus,
            description: newDescription,
            location: locationStr,
            event_timestamp: result.latestStatusDetail?.date || new Date().toISOString(),
            raw_event: result.latestStatusDetail || null,
          }),
        })

        results.updated++
      } catch {
        results.errors++
      }
    }

    return res.status(200).json({
      message: 'Tracking refresh completed',
      results,
      duration_ms: Date.now() - startTime,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal error',
      results,
      duration_ms: Date.now() - startTime,
    })
  }
}
