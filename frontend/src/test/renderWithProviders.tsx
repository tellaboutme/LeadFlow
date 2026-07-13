import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { createQueryClient } from '@/lib/queryClient'

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', state }: { route?: string; state?: unknown } = {},
) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: route, state }]}>{ui}</MemoryRouter>
      <Toaster />
    </QueryClientProvider>,
  )
}
