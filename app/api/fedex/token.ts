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

  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey,
    })

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ error: `FedEx auth failed: ${response.status}`, detail: errorText })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Connection failed' })
  }
}
