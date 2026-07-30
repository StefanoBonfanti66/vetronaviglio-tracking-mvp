import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTracker } from '../lib/tracking/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CRON_SECRET = process.env.CRON_SECRET

const ACTIVE_STATUSES = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'exception']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (req.method === 'GET') {
    const authHeader = req.headers.authorization
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' })
  }

  const startTime = Date.now()
  const globalResults: Record<string, { updated: number; unchanged: number; errors: number; skipped: number; total: number }> = {}

  try {
    // 1. Get all carriers with api_available = true
    const carriersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/carriers?api_available=eq.true&select=id,code,name`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )
    const carriers = await carriersRes.json()

    if (!carriers.length) {
      return res.status(200).json({
        message: 'No carriers with API configured',
        duration_ms: Date.now() - startTime,
      })
    }

    // 2. For each carrier, refresh active shipments
    for (const carrier of carriers) {
      const results = { updated: 0, unchanged: 0, errors: 0, skipped: 0, total: 0 }

      const shipmentsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/shipments?carrier_id=eq.${carrier.id}&status=in.(${ACTIVE_STATUSES.join(',')})&select=id,tracking_number,status,status_description`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      )
      const shipments = await shipmentsRes.json()

      if (!shipments.length) {
        globalResults[carrier.code] = results
        continue
      }

      results.total = shipments.length

      let tracker: ReturnType<typeof getTracker> | null = null
      try {
        tracker = getTracker(carrier.code, carrier.id)
      } catch {
        results.errors = shipments.length
        globalResults[carrier.code] = results
        continue
      }

      for (const shipment of shipments) {
        try {
          const trackResult = await tracker.track(shipment.tracking_number)

          const now = new Date().toISOString()
          const isUnchanged = trackResult.status === shipment.status && trackResult.status_description === shipment.status_description

          await fetch(`${SUPABASE_URL}/rest/v1/shipments?id=eq.${shipment.id}`, {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_SERVICE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              status: trackResult.status,
              status_description: trackResult.status_description,
              last_update: now,
            }),
          })

          if (isUnchanged) {
            results.unchanged++
            continue
          }

          const lastEvent = trackResult.events[0]
          if (lastEvent) {
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
                status: lastEvent.status,
                description: lastEvent.description,
                location: lastEvent.location,
                event_timestamp: lastEvent.timestamp,
                raw_event: lastEvent.raw_event,
              }),
            })
          }

          results.updated++
        } catch {
          results.errors++
        }
      }

      globalResults[carrier.code] = results
    }

    return res.status(200).json({
      message: 'Tracking refresh completed',
      carriers: globalResults,
      duration_ms: Date.now() - startTime,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal error',
      carriers: globalResults,
      duration_ms: Date.now() - startTime,
    })
  }
}
