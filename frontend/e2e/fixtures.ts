import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'

// PageTransition (AnimatePresence, keyed by pathname) fades each route in
// over ~150ms and remounts the page component when the key changes.
// Interacting with a just-navigated page (e.g. filling a form) before this
// settles can land on an instance that's about to be replaced — wait for
// full opacity first. A real condition wait, not an arbitrary sleep.
export async function waitForPageSettled(page: Page) {
  await expect(page.locator('main > div').first()).toHaveCSS('opacity', '1')
}

// Every spec starts from the same deterministic seed data (12 synthetic
// leads, default settings) by calling the test-mode-only reset endpoint
// before each test — no arbitrary sleeps, no shared mutable state between
// tests/specs.
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const response = await page.request.post(new URL('/api/v1/testing/reset', baseURL).toString())
    if (!response.ok()) {
      throw new Error(
        `DB reset failed (${response.status()}) — is the backend running with ENVIRONMENT=test?`,
      )
    }
    await use(page)
  },
})

export { expect }
