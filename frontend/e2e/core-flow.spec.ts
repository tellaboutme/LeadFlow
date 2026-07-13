import { expect, test, waitForPageSettled } from './fixtures'

async function totalLeadsCount(page: import('@playwright/test').Page): Promise<number> {
  const label = await page.getByRole('button', { name: /view leads for total leads/i }).getAttribute('aria-label')
  const match = label?.match(/:\s*(\d+)$/)
  if (!match) throw new Error(`Could not parse total leads from aria-label: ${label}`)
  return Number(match[1])
}

test('creates a lead, analyzes it, and sees it reflected on the dashboard and list', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  const totalBefore = await totalLeadsCount(page)

  await page.getByRole('link', { name: /leads/i }).first().click()
  await page.getByRole('button', { name: /new lead/i }).click()
  await waitForPageSettled(page) // form must be the final, stable instance before filling

  await page.getByLabel('Name').fill('E2E Playwright User')
  await page.getByLabel('Email').fill('e2e-playwright@example.com')
  await page.getByLabel('Description').fill(
    'We need a full e-commerce platform with cart, catalog and payments within six weeks.',
  )
  await page.getByRole('button', { name: /create lead/i }).click()

  await expect(page.getByRole('heading', { name: 'E2E Playwright User' })).toBeVisible()

  // Analysis is synchronous (mock provider), so the card settles without a
  // fixed sleep — Playwright's own polling assertion is the wait.
  await expect(page.getByRole('button', { name: /^re-analyze$/i })).toBeVisible({ timeout: 10_000 })

  await page.getByRole('button', { name: /back to leads/i }).click()
  await expect(page.getByText('E2E Playwright User')).toBeVisible()

  await page.getByRole('link', { name: /dashboard/i }).first().click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect
    .poll(() => totalLeadsCount(page), { timeout: 10_000 })
    .toBe(totalBefore + 1)
})

test('re-analyzing an already-notified lead does not resend a duplicate Telegram message', async ({ page }) => {
  // Regression coverage (UI level) for the notify-dedup fix: after two
  // consecutive analyze requests on the same lead, the notification card
  // still shows exactly one "sent" outcome, never flips back to a resend.
  await page.goto('/settings')
  await page.getByLabel('Telegram chat ID').fill('123456')
  const enableSwitch = page.getByLabel('Telegram notifications')
  if (!(await enableSwitch.isChecked())) await enableSwitch.click()
  await page.getByRole('button', { name: /save changes/i }).click()
  await expect(page.getByText('Settings saved')).toBeVisible()

  await page.goto('/leads')
  await page.getByLabel('Search leads').fill('Ishaan Rao') // seeded: won, high priority, completed analysis
  await page.getByText('Ishaan Rao').click()
  await waitForPageSettled(page)

  await page.getByRole('button', { name: /send now|resend/i }).click()
  await expect(page.getByText(/last sent/i)).toBeVisible({ timeout: 10_000 })
  const firstSentText = await page.getByText(/last sent/i).textContent()

  await page.getByRole('button', { name: /^re-analyze$/i }).click()
  await expect(page.getByRole('button', { name: /^re-analyze$/i })).toBeVisible({ timeout: 10_000 })

  const secondSentText = await page.getByText(/last sent/i).textContent()
  expect(secondSentText).toBe(firstSentText) // unchanged: re-analyze did not resend
})
