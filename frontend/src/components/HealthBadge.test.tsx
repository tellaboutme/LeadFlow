import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { HealthBadge } from './HealthBadge'

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('HealthBadge', () => {
  it('shows connected state when the backend responds ok', async () => {
    renderWithClient(<HealthBadge />)

    expect(await screen.findByText(/Backend connected/i)).toBeInTheDocument()
  })

  it('shows unreachable state when the backend errors', async () => {
    server.use(http.get('*/api/v1/health', () => HttpResponse.json({ detail: 'down' }, { status: 503 })))

    renderWithClient(<HealthBadge />)

    expect(await screen.findByText(/Backend unreachable/i)).toBeInTheDocument()
  })
})
