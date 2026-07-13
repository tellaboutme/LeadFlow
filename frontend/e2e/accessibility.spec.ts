import AxeBuilder from '@axe-core/playwright'
import { expect, test, waitForPageSettled } from './fixtures'

// One completed seeded lead (Elena Ivanova, contacted/high) covers the
// details page without needing a fresh create.
const PAGES: { name: string; goto: (page: import('@playwright/test').Page) => Promise<void> }[] = [
  { name: 'dashboard', goto: async (page) => { await page.goto('/') } },
  { name: 'leads list', goto: async (page) => { await page.goto('/leads') } },
  { name: 'lead form', goto: async (page) => { await page.goto('/leads/new') } },
  {
    name: 'lead details',
    goto: async (page) => {
      await page.goto('/leads')
      await page.getByText('Elena Ivanova').click()
      await expect(page.getByRole('heading', { name: 'Elena Ivanova' })).toBeVisible()
    },
  },
  { name: 'settings', goto: async (page) => { await page.goto('/settings') } },
]

for (const { name, goto } of PAGES) {
  test(`${name} has no critical or serious accessibility violations`, async ({ page }) => {
    await goto(page)
    // See waitForPageSettled: axe must read final colors, not a mid-fade blend.
    await waitForPageSettled(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const seriousOrWorse = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(seriousOrWorse, JSON.stringify(seriousOrWorse, null, 2)).toEqual([])
  })
}
