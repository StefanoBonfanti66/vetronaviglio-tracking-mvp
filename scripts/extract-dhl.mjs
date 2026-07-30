import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const DHL_USER = process.env.DHL_USER || 'm.colombo@vetronaviglio.it'
const DHL_PASS = process.env.DHL_PASS || 'Vetronaviglio1&'

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('1. Navigating to MyDHL+ My Shipments...')
  await page.goto('https://mydhl.express.dhl/it/it/manage-shipments.html', { waitUntil: 'load', timeout: 45000 })

  const currentUrl = page.url()
  console.log('   URL:', currentUrl)

  if (currentUrl.includes('login') || currentUrl.includes('sso') || currentUrl.includes('dhip') || currentUrl.includes('dhlid')) {
    console.log('2. Login page detected.')
  } else if (currentUrl.includes('/home.html')) {
    console.log('2. On home page (not logged in). Clicking login...')

    const loginBtn = page.getByRole('button', { name: /accedi|login|sign in/i }).first()
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.click()
      await page.waitForTimeout(2000)
    } else {
      const loginLink = page.locator('a:has-text("Accedi"), a:has-text("Login"), a:has-text("Sign in")').first()
      if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginLink.click()
        await page.waitForTimeout(2000)
      } else {
        console.log('   No login button found. Navigating to DHL Pass directly...')
        await page.goto('https://dhip.dhl.com/dhip/dhip?sp=DHLEWF&redirect_uri=https://mydhl.express.dhl/dhip-callback&client_id=DHLEWF&response_type=code', { waitUntil: 'load', timeout: 30000 })
      }
    }
  }

  console.log('   After login URL:', page.url())
  await page.waitForTimeout(2000)

  const needsLogin = page.url().includes('login') || page.url().includes('sso') || page.url().includes('dhip') || page.url().includes('dhlid')
  if (needsLogin) {
    console.log('3. Filling credentials...')

    const userInput = page.locator('input[name="userId"], input[type="email"], input[name="username"], input[name="loginfmt"]').first()
    if (await userInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userInput.fill(DHL_USER)
      const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first()
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click()
      } else {
        await page.keyboard.press('Enter')
      }
      await page.waitForTimeout(2000)
    }

    const passInput = page.locator('input[type="password"], input[name="password"]').first()
    if (await passInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await passInput.fill(DHL_PASS)
      const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first()
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click()
      } else {
        await page.keyboard.press('Enter')
      }
      await page.waitForTimeout(3000)
    } else {
      console.log('   Password field not found (may need MFA or different flow)')
    }

      try {
        await page.waitForURL('**/manage-shipments**', { timeout: 15000 })
      } catch {
        console.log('   Navigate to manage-shipments manually in the browser...')
        console.log(`   Current URL: ${page.url()}`)
      await page.goto('https://mydhl.express.dhl/it/it/manage-shipments.html', { waitUntil: 'load', timeout: 30000 }).catch(() => {})
    }
  }

  await page.waitForTimeout(2000)
  console.log('   Final URL:', page.url())

  const cookies = await context.cookies()
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')
  const xsrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN')
  const xsrfToken = xsrfCookie ? xsrfCookie.value : (cookies.find(c => c.name.toLowerCase().includes('xsrf'))?.value || '')
  const dhlSession = cookies.find(c => c.name.toLowerCase().includes('session') || c.name === 'ewfSessionId')

  console.log(`4. Got ${cookies.length} cookies, XSRF: ${xsrfToken ? 'yes' : 'no'}, Session: ${dhlSession ? 'yes' : 'no'}`)
  const cookieNames = cookies.map(c => c.name).join(', ')
  console.log(`   Cookies: ${cookieNames}`)

  const headers = {
    'content-type': 'application/json',
    'x-requested-with': 'XMLHttpRequest',
    'referer': 'https://mydhl.express.dhl/it/it/manage-shipments.html',
    'cookie': cookieString,
  }
  if (xsrfToken) {
    headers['x-xsrf-token'] = xsrfToken
  }

  console.log('5. Calling DHL search API...')
  const dhlRes = await context.request.fetch('https://mydhl.express.dhl/api/mms/search', {
    method: 'POST',
    headers,
    data: JSON.stringify({
      page: { pageNumber: 0, pageSize: 500 },
      statusFilters: [],
      dateFilter: { type: 'ALL' },
      myShipmentViewMode: 'MY_SHIPMENTS',
      shipmentVisibility: 'SHOW_VISIBLE_ONLY',
    }),
  })

  console.log(`   Response status: ${dhlRes.status()}`)

  if (!dhlRes.ok()) {
    const body = await dhlRes.text()
    console.error(`   DHL API error body: ${body.slice(0, 500)}`)
    await browser.close()
    process.exit(1)
  }

  const data = await dhlRes.json()
  const shipments = data.shipments ?? []
  console.log(`   Total shipments: ${data.page?.totalElements ?? '?'}`)
  console.log(`   Page returned: ${shipments.length}`)

  const valid = shipments.filter(s => {
    if (!s.airWayBill) return false
    if (s.airWayBill.endsWith('_FAV')) return false
    return true
  })

  console.log(`   Valid (with AWB, no _FAV): ${valid.length}`)

  const trackingNumbers = valid.map(s => ({
    trackingNumber: s.airWayBill,
    status: s.logicalCategory || s.status || 'UNKNOWN',
    destination: s.toContact ? [s.toContact.city, s.toContact.countryCode].filter(Boolean).join(', ') || null : null,
  }))

  const byStatus = {}
  for (const s of trackingNumbers) {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1
  }
  console.log('\n6. Breakdown by status:')
  for (const [status, count] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${status}: ${count}`)
  }

  writeFileSync('./scripts/.dhl-data.json', JSON.stringify(trackingNumbers, null, 2))
  console.log(`\n7. Saved ${trackingNumbers.length} DHL shipments to scripts/.dhl-data.json`)

  await browser.close()
}

main().catch(console.error)
