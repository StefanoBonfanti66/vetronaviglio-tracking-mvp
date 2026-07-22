import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.FEDEX_API_KEY
  const secretKey = process.env.FEDEX_SECRET_KEY
  const baseUrl = process.env.FEDEX_BASE_URL

  if (!apiKey || !secretKey || !baseUrl) {
    return res.status(500).json({ error: 'FedEx credentials not configured on server' })
  }

  const { trackingNumber } = req.body
  if (!trackingNumber) {
    return res.status(400).json({ error: 'trackingNumber is required' })
  }

  try {
    // 1. Get OAuth token
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey,
    })
    const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text()
      return res.status(tokenRes.status).json({ error: `FedEx auth failed: ${tokenRes.status}`, detail: errorText })
    }

    const tokenData = await tokenRes.json()

    // 2. Track shipment
    const trackRes = await fetch(`${baseUrl}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.access_token}`,
        'X-locale': 'it_IT',
      },
      body: JSON.stringify({
        includeDetailedScans: true,
        trackingInfo: [
          {
            trackingNumberInfo: {
              trackingNumber,
            },
          },
        ],
      }),
    })

    if (!trackRes.ok) {
      const errorText = await trackRes.text()
      return res.status(trackRes.status).json({ error: `FedEx track failed: ${trackRes.status}`, detail: errorText })
    }

    const trackData = await trackRes.json()
    return res.status(200).json(trackData)
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Connection failed' })
  }
}
