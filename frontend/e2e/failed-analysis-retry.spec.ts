import { expect, test } from './fixtures'

test('retries a failed analysis and it resolves', async ({ page }) => {
  await page.goto('/leads')
  await page.getByLabel('Search leads').fill('Liam Walsh') // seeded with analysis_status=failed
  await page.getByText('Liam Walsh').click()

  // "Analysis failed" appears both as a status badge and in the descriptive
  // paragraph — target the paragraph specifically to avoid ambiguity.
  const failedMessage = page.getByText(/^analysis failed:/i)
  await expect(failedMessage).toBeVisible()
  await expect(page.getByText('Insufficient detail to analyze.')).toBeVisible()

  await page.getByRole('button', { name: /^analyze$/i }).click()

  // No fixed sleep: poll until the failed state clears (mock provider always
  // resolves deterministically, so this is bounded, not flaky).
  await expect(failedMessage).not.toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: /^re-analyze$/i })).toBeVisible()
})
