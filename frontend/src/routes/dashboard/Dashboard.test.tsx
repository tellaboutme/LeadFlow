import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { resetLeadStore } from '@/mocks/handlers'
import type { LeadBackState } from '@/lib/navigation'
import { renderWithProviders } from '@/test/renderWithProviders'
import { Dashboard } from './Dashboard'

function LeadDetailsStub() {
  const location = useLocation()
  const state = location.state as LeadBackState | null
  return <p>Lead details page (back: {state?.backLabel ?? 'none'})</p>
}

function LeadsListStub() {
  const location = useLocation()
  return <p>Leads page ({location.search || 'no filter'})</p>
}

function renderDashboard() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/leads" element={<LeadsListStub />} />
      <Route path="/leads/new" element={<p>New lead page</p>} />
      <Route path="/leads/:leadId" element={<LeadDetailsStub />} />
    </Routes>,
    { route: '/' },
  )
}

describe('Dashboard', () => {
  it('renders stat cards, chart, and recent leads from seeded data', async () => {
    renderDashboard()

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Total leads')).toBeInTheDocument()
    expect(screen.getByText('Leads by priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority legend')).toHaveTextContent('LowMediumHighUrgent')
    expect(screen.getByText('Recent leads')).toBeInTheDocument()
    expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
  })

  it('shows the onboarding empty state with no leads', async () => {
    resetLeadStore([])
    renderDashboard()

    expect(await screen.findByText(/no leads yet/i)).toBeInTheDocument()
  })

  it('navigates to a recent lead with dashboard back-context', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await screen.findByText('Alice Anderson')
    await user.click(screen.getByText('Alice Anderson'))

    expect(await screen.findByText(/back: back to dashboard/i)).toBeInTheDocument()
  })

  it('drills down from stat cards to a filtered leads list', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await screen.findByText('Total leads')
    await user.click(screen.getByRole('button', { name: /view leads for won/i }))

    expect(await screen.findByText('Leads page (?status=won)')).toBeInTheDocument()
  })

  it(
    'drills down from a priority chart bar with a toast',
    async () => {
      const user = userEvent.setup()
      renderDashboard()

      await screen.findByText('Leads by priority')
      // Real SVG + ResizeObserver-driven rendering is the heaviest async path
      // in this suite, so it gets extra margin under full-suite CPU contention.
      const bar = await screen.findByRole('button', { name: /view \d+ high leads/i }, { timeout: 20_000 })
      await user.click(bar)

      expect(await screen.findByText(/showing \d+ high lead/i)).toBeInTheDocument()
      expect(await screen.findByText('Leads page (?priority=high)')).toBeInTheDocument()
    },
    25_000,
  )

  it('shows an error state and can retry', async () => {
    server.use(http.get('*/api/v1/dashboard/stats', () => HttpResponse.json({ detail: 'down' }, { status: 500 })))
    renderDashboard()

    expect(await screen.findByText(/failed to load dashboard/i)).toBeInTheDocument()

    server.resetHandlers()
    await userEvent.setup().click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})
