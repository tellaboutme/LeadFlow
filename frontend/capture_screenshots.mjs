// Captures the portfolio screenshots from the running Docker stack.
// All data is the synthetic demo seed — no real leads, ever.
import { chromium } from 'playwright'
import path from 'node:path'

const BASE = process.env.SHOT_BASE ?? 'http://localhost:8081'
const OUT = path.resolve('../docs/screenshots')

const browser = await chromium.launch()

async function settle(page) {
  // PageTransition fades content in; wait for it so shots are never mid-fade.
  await page.locator('main > div').first().waitFor()
  await page.waitForFunction(() => {
    const el = document.querySelector('main > div')
    return el && getComputedStyle(el).opacity === '1'
  })
}

// --- Desktop ---------------------------------------------------------------
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await desktop.newPage()

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.getByRole('heading', { name: 'Dashboard' }).waitFor()
await page.locator('svg .recharts-bar-rectangle').first().waitFor({ timeout: 15000 })
await settle(page)
await page.screenshot({ path: path.join(OUT, '01-dashboard.png') })

await page.goto(`${BASE}/leads`, { waitUntil: 'networkidle' })
await page.getByText('Alice Anderson').waitFor()
await settle(page)
await page.screenshot({ path: path.join(OUT, '02-leads-list.png') })

// A seeded lead with a completed AI analysis.
await page.getByText('Farid Hassan').click()
await page.getByRole('heading', { name: 'Farid Hassan' }).waitFor()
await settle(page)
await page.screenshot({ path: path.join(OUT, '03-lead-details.png') })

await page.goto(`${BASE}/leads/new`, { waitUntil: 'networkidle' })
await page.getByLabel('Name').waitFor()
await settle(page)
await page.screenshot({ path: path.join(OUT, '04-new-lead.png') })

await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
await page.getByLabel('Company name').waitFor()
await settle(page)
await page.screenshot({ path: path.join(OUT, '05-settings.png') })

// --- Mobile ----------------------------------------------------------------
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const m = await mobile.newPage()
await m.goto(BASE, { waitUntil: 'networkidle' })
await m.getByRole('heading', { name: 'Dashboard' }).waitFor()
await m.locator('svg .recharts-bar-rectangle').first().waitFor({ timeout: 15000 })
await settle(m)
await m.screenshot({ path: path.join(OUT, '06-mobile-dashboard.png') })

await browser.close()
console.log('captured 6 screenshots ->', OUT)
