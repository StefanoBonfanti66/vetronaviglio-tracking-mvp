import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTracker } from './lib/tracking/index.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { carrier, trackingNumber } = req.body
  if (!carrier || !trackingNumber) {
    return res.status(400).json({ error: 'carrier and trackingNumber are required' })
  }

  try {
    const tracker = getTracker(carrier)
    const result = await tracker.track(trackingNumber)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Tracking failed',
    })
  }
}
