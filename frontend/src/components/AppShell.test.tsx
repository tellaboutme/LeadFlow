import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '@/lib/queryClient'
import { AppShell } from './AppShell'

function renderShell() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AppShell', () => {
  it('renders the desktop sidebar navigation', () => {
    renderShell()
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /leads/i }).length).toBeGreaterThan(0)
  })

  it('opens a mobile navigation drawer via the menu button', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
