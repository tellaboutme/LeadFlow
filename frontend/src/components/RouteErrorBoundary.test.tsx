import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RouteErrorBoundary } from './RouteErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <p>Recovered</p>
}

describe('RouteErrorBoundary', () => {
  it('renders a fallback with retry when a child throws', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    function Wrapper() {
      return (
        <RouteErrorBoundary>
          <Bomb shouldThrow={shouldThrow} />
        </RouteErrorBoundary>
      )
    }

    const { rerender } = render(
      <MemoryRouter>
        <Wrapper />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument()

    // Update the child's props first (simulating a code/data fix), then
    // trigger the boundary's reset so it re-attempts rendering with them.
    shouldThrow = false
    rerender(
      <MemoryRouter>
        <Wrapper />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('Recovered')).toBeInTheDocument()
  })
})
