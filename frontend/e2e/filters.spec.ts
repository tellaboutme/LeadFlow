import { expect, test } from './fixtures'

test('filters the leads list by status and by priority', async ({ page }) => {
  await page.goto('/leads')
  await expect(page.getByText('Alice Anderson')).toBeVisible()

  // Filter selects are labeled combobox triggers; the priority/status *sort*
  // buttons in the table header share the same accessible names, so target
  // the combobox role explicitly to avoid a strict-mode ambiguity.
  await page.getByRole('combobox', { name: 'Status' }).click()
  await page.getByRole('option', { name: 'Won' }).click()
  await expect(page).toHaveURL(/status=won/)
  await expect(page.getByText('Ishaan Rao')).toBeVisible() // seeded won/high
  await expect(page.getByText('Julia Novak')).toBeVisible() // seeded won/low
  await expect(page.getByText('Alice Anderson')).not.toBeVisible()

  await page.getByRole('button', { name: /clear/i }).click()
  await expect(page).not.toHaveURL(/status=/)

  await page.getByRole('combobox', { name: 'Priority' }).click()
  await page.getByRole('option', { name: 'Urgent' }).click()
  await expect(page).toHaveURL(/priority=urgent/)
  await expect(page.getByText('Farid Hassan')).toBeVisible() // seeded urgent
  await expect(page.getByText('Alice Anderson')).not.toBeVisible()
})

test('search narrows results and an empty match shows the filtered empty state', async ({ page }) => {
  await page.goto('/leads')
  await page.getByLabel('Search leads').fill('grace')
  await expect(page.getByText('Grace Green')).toBeVisible()
  await expect(page.getByText('Alice Anderson')).not.toBeVisible()

  await page.getByLabel('Search leads').fill('no-such-lead-xyz')
  await expect(page.getByText(/no leads match your filters/i)).toBeVisible()
})
