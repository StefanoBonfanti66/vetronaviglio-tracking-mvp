import { chromium } from 'playwright'
import { writeFileSync, existsSync, readFileSync } from 'fs'

const SESSION_FILE = './scripts/.dhl-session.json'
const VERCEL_ENDPOINT = process.env.VERCEL_DISCOVER_URL || 'http://localhost:3000/api/discover'

const DHL_USER = process.env.DHL_USER || 'm.colombo@vetronaviglio.it'
const DHL_PASS = process.env.DHL_PASS || 'Vetronaviglio1&'

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

async function extractTrackingNumbers(page) {
  return page.evaluate(async () => {
    const xsrfCookie = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const xsrf = xsrfCookie ? xsrfCookie.split('=')[1] : ''
    const res = await fetch('/api/mms/search', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xsrf-token': xsrf,
        'x-requested-with': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        page: { pageNumber: 0, pageSize: 500 },
        statusFilters: [],
        dateFilter: { type: 'ALL' },
        myShipmentViewMode: 'MY_SHIPMENTS',
        shipmentVisibility: 'SHOW_VISIBLE_ONLY',
      }),
    })
    if (!res.ok) return { ok: false, status: res.status }
    const data = await res.json()
    const items = (data.myShipmentItems || [])
      .map(i => i.shipmentData && i.shipmentData.airWayBill)
      .filter(Boolean)
    const awbs = [...new Set(items.filter(a => !a.endsWith('_FAV')))]
    return { ok: true, awbs, total: items.length }
  })
}

async function getDhlTrackingNumbers(browser) {
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('Navigating to MyDHL+...')
  await page.goto('https://mydhl.express.dhl/it/it/home.html', { waitUntil: 'networkidle', timeout: 30000 })

  const currentUrl = page.url()
  console.log('Current URL:', currentUrl)

  const needsLogin = currentUrl.includes('login') || currentUrl.includes('sso') || currentUrl.includes('dhip')

  if (needsLogin) {
    console.log('Login page detected.')

    if (process.argv.includes('--manual')) {
      console.log('Modalità manuale: completa tu il login nel browser (max 10 minuti)...')
    } else {
      console.log('Attempting automatic login...')
      const userInput = page.locator('input[name="userId"], input[type="email"], input[name="username"]').first()
      if (await userInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await userInput.fill(DHL_USER)
        const nextBtn = page.locator('button:has-text("Avanti"), button:has-text("Next"), button[type="submit"]').first()
        await nextBtn.click()
        await page.waitForTimeout(2000)
      }

      const passInput = page.locator('input[type="password"], input[name="password"]').first()
      if (await passInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await passInput.fill(DHL_PASS)
        const loginBtn = page.locator('button:has-text("Accedi"), button:has-text("Log in"), button[type="submit"]').first()
        await loginBtn.click()
      }
    }

    if (process.argv.includes('--headed')) {
      const deadline = Date.now() + 600000
      while (Date.now() < deadline) {
        const url = page.url()
        if (!url.includes('login') && !url.includes('sso') && !url.includes('dhip')) break
        await page.waitForTimeout(2000)
      }
      console.log('After login URL:', page.url())
    } else {
      await page.waitForURL('**/home.html**', { timeout: 20000 }).catch(() => {})
      await page.waitForTimeout(3000)
      console.log('After login URL:', page.url())
    }
  }

  if (page.url().includes('login') || page.url().includes('sso')) {
    console.log('Still on login page — may need manual interaction')
    console.log('Try running with --headed')
    await page.close()
    await context.close()
    return null
  }

  console.log('Extracting tracking numbers from MyDHL+...')
  const result = await extractTrackingNumbers(page)

  await page.close()
  await context.close()

  if (!result.ok) {
    console.log(`Extraction failed: HTTP ${result.status} — session may be expired`)
    return null
  }

  console.log(`Got ${result.awbs.length} tracking numbers (${result.total - result.awbs.length} favorites excluded)`)
  return { carrier: 'dhl', trackingNumbers: result.awbs, extractedAt: new Date().toISOString() }
}

async function callDiscoverEndpoint(session, endpoint) {
  console.log(`Calling ${endpoint} for DHL (${session.trackingNumbers.length} tracking numbers)...`)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carrier: 'dhl', trackingNumbers: session.trackingNumbers }),
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
    if (!session || !Array.isArray(session.trackingNumbers)) {
      console.error('No saved DHL tracking numbers found. Run without --no-browser first.')
      process.exit(1)
    }
    console.log('Using saved DHL session from', SESSION_FILE)
  } else {
    const browser = await chromium.launch({
      headless: !process.argv.includes('--headed'),
    })
    try {
      session = await getDhlTrackingNumbers(browser)
      if (!session) {
        console.error('Could not extract DHL tracking numbers')
        process.exit(1)
      }
      saveSession(session)
      console.log('DHL tracking numbers saved to', SESSION_FILE)
    } finally {
      await browser.close()
    }
  }

  await callDiscoverEndpoint(session, endpoint)
}

main().catch(console.error)
