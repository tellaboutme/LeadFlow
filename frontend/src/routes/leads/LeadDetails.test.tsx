import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LeadDetails } from './LeadDetails'
import { LeadsList } from './LeadsList'

function renderDetails(leadId = 'lead-3', state?: unknown) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>Dashboard page</p>} />
      <Route path="/leads" element={<LeadsList />} />
      <Route path="/leads/:leadId" element={<LeadDetails />} />
    </Routes>,
    { route: `/leads/${leadId}`, state },
  )
}

describe('LeadDetails', () => {
  it('shows a not-found state for an unknown lead', async () => {
    renderDetails('does-not-exist')
    expect(await screen.findByText(/lead not found/i)).toBeInTheDocument()
  })

  it('shows the not-requested analysis state and can trigger analysis', async () => {
    const user = userEvent.setup()
    renderDetails('lead-3')

    expect(await screen.findByText(/not requested/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^analyze$/i }))

    expect(await screen.findByText(/analyzed/i)).toBeInTheDocument()
    expect(screen.getByText(/synthetic analysis summary/i)).toBeInTheDocument()
  })

  it('shows a failed analysis state with a retry action', async () => {
    server.use(
      http.post('*/api/v1/leads/:leadId/analyze', () =>
        HttpResponse.json({ detail: 'AI provider unavailable' }, { status: 502 }),
      ),
    )
    const user = userEvent.setup()
    renderDetails('lead-3')

    await screen.findByText(/not requested/i)
    await user.click(screen.getByRole('button', { name: /^analyze$/i }))

    await waitFor(() => expect(screen.getByText(/analysis request failed/i)).toBeInTheDocument())
  })

  it('updates the lead status', async () => {
    const user = userEvent.setup()
    renderDetails('lead-1')

    await screen.findByText('Alice Anderson')
    await user.click(screen.getByLabelText('Status'))
    await user.click(await screen.findByRole('option', { name: 'Won' }))

    await waitFor(() => expect(screen.getByText(/status updated/i)).toBeInTheDocument())
  })

  it('sends a manual notification', async () => {
    const user = userEvent.setup()
    renderDetails('lead-3')

    await screen.findByText('Carol Chen')
    expect(screen.getByText(/not required/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /send now/i }))
    await waitFor(() => expect(screen.getByText(/notification sent/i)).toBeInTheDocument())
  })

  it('defaults the back button to "Back to leads" when opened directly', async () => {
    const user = userEvent.setup()
    renderDetails('lead-1')

    await screen.findByText('Alice Anderson')
    await user.click(screen.getByRole('button', { name: /back to leads/i }))

    expect(await screen.findByRole('heading', { name: 'Leads' })).toBeInTheDocument()
  })

  it('shows "Back to dashboard" and returns there when opened from the dashboard', async () => {
    const user = userEvent.setup()
    renderDetails('lead-1', { backTo: '/', backLabel: 'Back to dashboard' })

    await screen.findByText('Alice Anderson')
    expect(screen.queryByRole('button', { name: /back to leads/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back to dashboard/i }))

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
  })

  it('deletes the lead and navigates back to the list', async () => {
    const user = userEvent.setup()
    renderDetails('lead-2')

    await screen.findByText('Bob Brown')
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(await screen.findByRole('heading', { name: 'Leads' })).toBeInTheDocument()
    expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument()
  })
})
