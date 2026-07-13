import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes, useParams } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LeadForm } from './LeadForm'

function DetailsStub() {
  const { leadId } = useParams<{ leadId: string }>()
  return <p>Details for {leadId}</p>
}

function renderForm() {
  return renderWithProviders(
    <Routes>
      <Route path="/leads/new" element={<LeadForm />} />
      <Route path="/leads/:leadId" element={<DetailsStub />} />
    </Routes>,
    { route: '/leads/new' },
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Alice Anderson')
  await user.type(screen.getByLabelText('Email'), 'alice@example.com')
  await user.type(
    screen.getByLabelText('Description'),
    'We need a marketing website redesign with a CMS and blog.',
  )
}

describe('LeadForm', () => {
  it('shows validation errors for short name, invalid email, and short description', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Name'), 'A')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Description'), 'too short')
    await user.click(screen.getByRole('button', { name: /create lead/i }))

    expect(await screen.findAllByText(/./)).toBeTruthy()
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Description')).toHaveAttribute('aria-invalid', 'true')
  })

  it('creates a lead and navigates to its details on success', async () => {
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create lead/i }))

    expect(await screen.findByText(/details for lead-/i)).toBeInTheDocument()
  })

  it('keeps entered values and shows an error toast when the request fails', async () => {
    server.use(http.post('*/api/v1/leads', () => HttpResponse.json({ detail: 'boom' }, { status: 500 })))
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create lead/i }))

    expect(await screen.findByText(/could not create the lead/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Alice Anderson')
    expect(screen.getByLabelText('Description')).toHaveValue(
      'We need a marketing website redesign with a CMS and blog.',
    )
  })

  it('shows a running character counter for the description', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Description'), 'hello')
    await waitFor(() => expect(screen.getByText('5/5000')).toBeInTheDocument())
  })

  it('disables the submit button while the request is in flight', async () => {
    let requestCount = 0
    server.use(
      http.post('*/api/v1/leads', async () => {
        requestCount += 1
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({ detail: 'boom' }, { status: 500 })
      }),
    )
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    const submitButton = screen.getByRole('button', { name: /create lead/i })
    await user.click(submitButton)
    expect(submitButton).toBeDisabled()

    await waitFor(() => expect(screen.getByRole('button', { name: /create lead/i })).not.toBeDisabled())
    expect(requestCount).toBe(1)
  })
})
