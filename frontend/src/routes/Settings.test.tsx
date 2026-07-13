import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { resetSettingsStore } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/renderWithProviders'
import { Settings } from './Settings'

describe('Settings', () => {
  it('loads current settings and integration status', async () => {
    renderWithProviders(<Settings />)

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Company name')).toHaveValue('')
    expect(screen.getByLabelText('Telegram notifications')).not.toBeChecked()
    expect(await screen.findAllByText('mock')).toHaveLength(2) // ai_provider + telegram_provider
  })

  it('saves a company name change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Settings />)

    const companyInput = await screen.findByLabelText('Company name')
    await user.type(companyInput, 'Acme Inc')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Settings saved')).toBeInTheDocument()
  })

  it('sends a Telegram test message and reports success', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Settings />)

    await screen.findByLabelText('Telegram chat ID')
    await user.type(screen.getByLabelText('Telegram chat ID'), '12345')
    await user.click(screen.getByRole('button', { name: /send test message/i }))

    expect(await screen.findByText(/test message sent via mock/i)).toBeInTheDocument()
  })

  it('reports a Telegram test failure when chat id is missing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Settings />)

    await screen.findByRole('button', { name: /send test message/i })
    await user.click(screen.getByRole('button', { name: /send test message/i }))

    expect(await screen.findByText(/chat_id is required/i)).toBeInTheDocument()
  })

  it('shows an error state and can retry', async () => {
    server.use(http.get('*/api/v1/settings', () => HttpResponse.json({ detail: 'down' }, { status: 500 })))
    renderWithProviders(<Settings />)

    expect(await screen.findByText(/failed to load settings/i)).toBeInTheDocument()

    server.resetHandlers()
    resetSettingsStore()
    await userEvent.setup().click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(screen.getByLabelText('Company name')).toHaveValue(''))
  })
})
