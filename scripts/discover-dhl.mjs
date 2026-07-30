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

async function getDhlSession(browser) {
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('Navigating to MyDHL+...')
  await page.goto('https://mydhl.express.dhl/it/it/home.html', { waitUntil: 'networkidle', timeout: 30000 })

  const currentUrl = page.url()
  console.log('Current URL:', currentUrl)

  const needsLogin = currentUrl.includes('login') || currentUrl.includes('sso') || currentUrl.includes('dhip')

  if (needsLogin) {
    console.log('Login page detected. Attempting login...')

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
      await page.waitForURL('**/home.html**', { timeout: 20000 }).catch(() => {})
    }

    await page.waitForTimeout(3000)
    console.log('After login URL:', page.url())
  }

  if (page.url().includes('login') || page.url().includes('sso')) {
    console.log('Still on login page — may need manual interaction')
    console.log('Try running with --headed')
    await page.close()
    await context.close()
    return null
  }

  console.log('Extracting session...')
  const cookies = await context.cookies()
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')

  const xsrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN')
  const xsrfToken = xsrfCookie ? xsrfCookie.value : ''

  console.log(`Got ${cookies.length} cookies, XSRF: ${xsrfToken ? 'yes' : 'no'}`)

  await page.close()
  await context.close()

  return { cookies: cookieString, xsrfToken, carrier: 'dhl' }
}

async function callDiscoverEndpoint(session, endpoint) {
  console.log(`Calling ${endpoint} for DHL...`)
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
      console.error('No saved DHL session found. Run without --no-browser first.')
      process.exit(1)
    }
    console.log('Using saved DHL session from', SESSION_FILE)
  } else {
    const browser = await chromium.launch({
      headless: !process.argv.includes('--headed'),
    })
    try {
      session = await getDhlSession(browser)
      if (!session) {
        console.error('Could not get DHL session')
        process.exit(1)
      }
      saveSession(session)
      console.log('DHL session saved to', SESSION_FILE)
    } finally {
      await browser.close()
    }
  }

  const result = await callDiscoverEndpoint(session, endpoint)
}

main().catch(console.error)
