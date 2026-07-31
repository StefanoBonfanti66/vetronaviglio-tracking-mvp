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

function saveSession(data) {
  writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2))
}

async function getFedExCookiesAndToken(browser) {
  const context = await browser.newContext()
  const page = await context.newPage()

  let capturedToken = null
  const capturedRequests = []
  page.on('request', req => {
    const url = req.url()
    if (!/visibilitieslist|shipments|track/i.test(url)) return
    const headers = req.headers()
    if (!capturedToken && url.includes('api.fedex.com')) {
      const auth = headers['authorization']
      if (auth && auth.startsWith('Bearer ')) {
        capturedToken = auth.slice(7)
      }
    }
    capturedRequests.push({
      method: req.method(),
      url,
      authorization: headers['authorization'] || null,
      cookie: headers['cookie'] ? `${headers['cookie'].slice(0, 120)}...` : null,
      body: req.postData() || null,
    })
  })
  page.on('response', res => {
    const url = res.url()
    if (!/visibilitieslist|shipments|track/i.test(url)) return
    const entry = capturedRequests.find(r => r.url === url && r.status === undefined)
    if (entry) entry.status = res.status()
  })

  console.log('Navigating to FedEx Login...')
  await page.goto('https://www.fedex.com/secure-login/it-it/#/credentials', { waitUntil: 'domcontentloaded', timeout: 40000 })

  const currentUrl = page.url()
  if (currentUrl.includes('login') || currentUrl.includes('auth')) {
    if (!process.argv.includes('--headed')) {
      console.log('Login required — run with --headed to complete the login manually')
      await page.close()
      await context.close()
      return null
    }
    console.log('Login page open — complete the login in the browser...')
    console.log('Waiting for login to complete...')
    await page.waitForURL(u => !u.toString().includes('login') && !u.toString().includes('auth'), { timeout: 120000 }).catch(() => {})
    console.log('Proceeding to extract session...')
  } else {
    console.log('Already logged in, extracting session...')
  }

  try {
    await page.goto('https://www.fedex.com/fedextracking/', { waitUntil: 'domcontentloaded', timeout: 40000 })
  } catch {}

  await page.waitForTimeout(8000)

  const cookies = await context.cookies()
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')

  const accessToken = await page.evaluate(() => {
    const authHeader = window.__INITIAL_STATE__?.auth?.accessToken || ''
    return authHeader
  })

  const tokenFromStorage = await page.evaluate(() => {
    const stores = [localStorage, sessionStorage]
    for (const store of stores) {
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        try {
          const raw = store.getItem(key)
          if (!raw) continue
          if (key.toLowerCase().includes('token')) {
            try {
              const val = JSON.parse(raw)
              if (typeof val === 'string') return val
              if (val?.access_token) return val.access_token
              if (val?.accessToken) return val.accessToken
              if (val?.token) return val.token
            } catch {}
          }
        } catch {}
      }
    }
    return null
  })

  const finalToken = capturedToken || accessToken || tokenFromStorage

  console.log(`Got ${cookies.length} cookies, token: ${finalToken ? 'yes' : 'no'}`)
  if (capturedRequests.length) {
    writeFileSync('./scripts/.fedex-requests.json', JSON.stringify(capturedRequests, null, 2))
    const urls = [...new Set(capturedRequests.map(r => r.url))]
    console.log(`Captured ${capturedRequests.length} tracking requests (saved to ./scripts/.fedex-requests.json):`)
    urls.slice(0, 15).forEach(u => console.log(' -', u))
  }

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
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
  const endpoint = args[0] || VERCEL_ENDPOINT
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
