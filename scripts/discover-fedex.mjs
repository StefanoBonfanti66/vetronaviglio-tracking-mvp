import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const SESSION_FILE = './scripts/.fedex-session.json'
const VERCEL_ENDPOINT = process.env.VERCEL_DISCOVER_URL || 'http://localhost:3000/api/discover'

async function loadSession() {
  if (!existsSync(SESSION_FILE)) return null
  try {
    return JSON.parse(readFileSync(SESSION_FILE, 'utf-8'))
  } catch {
    return null
  }
}

function saveSession(data: { cookies: string; accessToken: string }) {
  writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2))
}

async function getFedExCookiesAndToken(browser) {
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('Navigating to FedEx Tracking...')
  await page.goto('https://www.fedex.com/fedextracking/', { waitUntil: 'networkidle' })

  const currentUrl = page.url()
  if (currentUrl.includes('login') || currentUrl.includes('auth')) {
    console.log('Login required — use existing browser session with --headed or provide cookies')
    console.log('Current URL:', currentUrl)
    await page.close()
    await context.close()
    return null
  }

  console.log('Already logged in, extracting session...')

  const cookies = await context.cookies()
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')

  const accessToken = await page.evaluate(() => {
    const authHeader = window.__INITIAL_STATE__?.auth?.accessToken || ''
    return authHeader
  })

  const tokenFromStorage = await page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('token')) {
        try {
          const val = JSON.parse(localStorage.getItem(key))
          if (typeof val === 'string') return val
          if (val?.access_token) return val.access_token
        } catch {}
      }
    }
    return null
  })

  const finalToken = accessToken || tokenFromStorage

  console.log(`Got ${cookies.length} cookies, token: ${finalToken ? 'yes' : 'no'}`)

  await page.close()
  await context.close()

  return { cookies: cookieString, accessToken: finalToken }
}

async function callDiscoverEndpoint(session, endpoint) {
  console.log(`Calling ${endpoint}...`)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
  const data = await res.json()
  console.log(`Status: ${res.status}`)
  console.log(JSON.stringify(data, null, 2))
  return { ok: res.ok, data }
}

async function main() {
  const endpoint = process.argv[2] || VERCEL_ENDPOINT
  const noBrowser = process.argv.includes('--no-browser')

  let session = null

  if (noBrowser) {
    session = await loadSession()
    if (!session) {
      console.error('No saved session found. Run without --no-browser first.')
      process.exit(1)
    }
    console.log('Using saved session from', SESSION_FILE)
  } else {
    const browser = await chromium.launch({
      headless: !process.argv.includes('--headed'),
    })
    try {
      session = await getFedExCookiesAndToken(browser)
      if (!session) {
        console.error('Could not get FedEx session')
        process.exit(1)
      }
      saveSession(session)
      console.log('Session saved to', SESSION_FILE)
    } finally {
      await browser.close()
    }
  }

  const result = await callDiscoverEndpoint(session, endpoint)

  if (!result.ok && result.data?.error?.includes('session expired')) {
    console.log('\nSession expired. Re-running with browser to refresh...')
    if (!noBrowser) {
      const browser = await chromium.launch({ headless: false })
      try {
        session = await getFedExCookiesAndToken(browser)
        if (session) {
          saveSession(session)
          await callDiscoverEndpoint(session, endpoint)
        }
      } finally {
        await browser.close()
      }
    }
  }
}

main().catch(console.error)
