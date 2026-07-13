import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '@/lib/queryClient'
import App from './App'

function renderApp(initialEntry = '/') {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('App navigation', () => {
  it('renders the dashboard at the index route', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('navigates between routes via the sidebar links', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await screen.findByRole('heading', { name: /dashboard/i })
    await user.click(screen.getByRole('link', { name: /leads/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /leads/i })).toBeInTheDocument())

    await user.click(screen.getByRole('link', { name: /settings/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument())
  })

  it('shows a not-found state for an unknown route', async () => {
    renderApp('/does-not-exist')
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument()
  })
})
