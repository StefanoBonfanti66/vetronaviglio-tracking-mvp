const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

type CredentialMap = Record<string, string>

export async function getCarrierCredentials(carrierId: string): Promise<CredentialMap> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return {}
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/carrier_credentials?carrier_id=eq.${carrierId}&select=credential_key,credential_value`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    if (!res.ok) return {}
    const rows = await res.json()
    const map: CredentialMap = {}
    for (const row of rows) {
      map[row.credential_key] = row.credential_value
    }
    return map
  } catch {
    return {}
  }
}

export async function getCredential(carrierId: string, key: string): Promise<string | null> {
  const map = await getCarrierCredentials(carrierId)
  return map[key] || null
}
