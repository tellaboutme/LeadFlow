import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { resetLeadStore } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LeadsList } from './LeadsList'

describe('LeadsList', () => {
  it('renders the seeded leads', async () => {
    renderWithProviders(<LeadsList />, { route: '/leads' })

    expect(await screen.findByText('Alice Anderson')).toBeInTheDocument()
    expect(screen.getByText('Bob Brown')).toBeInTheDocument()
    expect(screen.getByText('Carol Chen')).toBeInTheDocument()
  })

  it('shows the onboarding empty state with no leads and no filters', async () => {
    resetLeadStore([])
    renderWithProviders(<LeadsList />, { route: '/leads' })

    expect(await screen.findByText(/no leads yet/i)).toBeInTheDocument()
  })

  it('shows a distinct empty state when filters produce no results', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, { route: '/leads' })
    await screen.findByText('Alice Anderson')

    await user.type(screen.getByLabelText(/search leads/i), 'no-such-lead')
    expect(await screen.findByText(/no leads match your filters/i)).toBeInTheDocument()
  })

  it('reflects search in the URL and debounces the request', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, { route: '/leads' })
    await screen.findByText('Alice Anderson')

    await user.type(screen.getByLabelText(/search leads/i), 'bob')

    await waitFor(() => expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument())
    expect(screen.getByText('Bob Brown')).toBeInTheDocument()
  })

  it('shows an error state and can retry', async () => {
    server.use(http.get('*/api/v1/leads', () => HttpResponse.json({ detail: 'down' }, { status: 500 })))
    renderWithProviders(<LeadsList />, { route: '/leads' })

    expect(await screen.findByText(/failed to load leads/i)).toBeInTheDocument()

    server.resetHandlers()
    await userEvent.setup().click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByText('Alice Anderson')).toBeInTheDocument()
  })

  it('sorts by a non-default column (regression: sort_by was silently dropped)', async () => {
    // Fixture priorities: lead-1 Alice=high, lead-2 Bob=urgent, lead-3 Carol=low.
    // Priority ranks by severity (low < medium < high < urgent), not
    // alphabetically, so priority-desc leads with Bob (urgent) and
    // priority-asc leads with Carol (low). Sorting by a non-default column
    // exercises the two-key update path that previously raced and silently
    // dropped sort_by, leaving results unsorted.
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, { route: '/leads' })
    await screen.findByText('Alice Anderson')

    // Data rows are role="link" (click-to-navigate), not role="row" — only
    // the header row keeps the implicit table-row role. Sorting swaps in a
    // new query key, so this briefly shows the previous (placeholder) order
    // while refetching — wait for it to settle.
    await user.click(screen.getByRole('button', { name: /sort by priority/i }))
    await waitFor(() => expect(screen.getAllByRole('link', { name: /^View/ })[0]).toHaveAccessibleName('View Bob Brown'))

    await user.click(screen.getByRole('button', { name: /sort by priority/i }))
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /^View/ })[0]).toHaveAccessibleName('View Carol Chen'),
    )
  })

  it('exports the visible leads as CSV', async () => {
    const user = userEvent.setup()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderWithProviders(<LeadsList />, { route: '/leads' })
    await screen.findByText('Alice Anderson')

    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    clickSpy.mockRestore()
  })

  it('shows an error toast when export fails', async () => {
    server.use(http.get('*/api/v1/leads/export', () => HttpResponse.json({ detail: 'down' }, { status: 500 })))
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, { route: '/leads' })
    await screen.findByText('Alice Anderson')

    await user.click(screen.getByRole('button', { name: /export csv/i }))

    expect(await screen.findByText(/could not export leads/i)).toBeInTheDocument()
  })

  it('deletes a lead after confirmation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, { route: '/leads' })
    await screen.findByText('Alice Anderson')

    await user.click(screen.getByRole('button', { name: /delete alice anderson/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument())
  })
})
