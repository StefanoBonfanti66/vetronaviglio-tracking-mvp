import { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const CREDENTIAL_SCHEMAS: Record<string, { key: string; label: string; sensitive: boolean; placeholder?: string }[]> = {
  fedex: [
    { key: 'FEDEX_API_KEY', label: 'API Key', sensitive: true },
    { key: 'FEDEX_SECRET_KEY', label: 'Secret Key', sensitive: true },
    { key: 'FEDEX_BASE_URL', label: 'Endpoint URL', sensitive: false, placeholder: 'https://apis.fedex.com' },
  ],
  dhl: [
    { key: 'DHL_API_KEY', label: 'API Key', sensitive: true },
  ],
}

async function fetchRows(url: string): Promise<any[]> {
  const res = await fetch(url, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  if (!res.ok) return []
  return res.json()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req

  if (method === 'GET') {
    const carriers = await fetchRows(
      `${SUPABASE_URL}/rest/v1/carriers?select=id,code,name,api_available`
    )

    const result: Record<string, any> = {}
    for (const carrier of carriers) {
      if (!carrier.api_available) continue
      const schema = CREDENTIAL_SCHEMAS[carrier.code]
      if (!schema) continue

      const rows = await fetchRows(
        `${SUPABASE_URL}/rest/v1/carrier_credentials?carrier_id=eq.${carrier.id}&select=credential_key,credential_value`
      )
      const existing: Record<string, any> = {}
      for (const row of rows) {
        existing[row.credential_key] = row.credential_value
      }

      const fields = schema.map(f => ({
        key: f.key,
        label: f.label,
        sensitive: f.sensitive,
        placeholder: f.placeholder || null,
        set: f.key in existing,
      }))
      result[carrier.code] = { carrierId: carrier.id, name: carrier.name, fields }
    }

    return res.json({ credentials: result })
  }

  if (method === 'PUT') {
    const { carrierCode, credentials } = req.body
    if (!carrierCode || !credentials) {
      return res.status(400).json({ error: 'Missing carrierCode or credentials' })
    }

    const schema = CREDENTIAL_SCHEMAS[carrierCode]
    if (!schema) return res.status(400).json({ error: `Unknown carrier: ${carrierCode}` })

    const carriers = await fetchRows(
      `${SUPABASE_URL}/rest/v1/carriers?code=eq.${carrierCode}&select=id`
    )
    if (!carriers.length) return res.status(404).json({ error: 'Carrier not found' })

    const carrierId = carriers[0].id

    for (const field of schema) {
      const value = credentials[field.key]
      if (value === undefined || value === null) continue

      const exists = await fetch(
        `${SUPABASE_URL}/rest/v1/carrier_credentials?carrier_id=eq.${carrierId}&credential_key=eq.${field.key}&select=id`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      ).then(r => r.json())

      if (exists?.length > 0) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/carrier_credentials?carrier_id=eq.${carrierId}&credential_key=eq.${field.key}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({ credential_value: value }),
          }
        )
      } else {
        await fetch(
          `${SUPABASE_URL}/rest/v1/carrier_credentials`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: 'return=minimal' },
            body: JSON.stringify({ carrier_id: carrierId, credential_key: field.key, credential_value: value }),
          }
        )
      }
    }

    return res.json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
