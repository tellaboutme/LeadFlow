import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LeadDetails } from './LeadDetails'

const meta: Meta<typeof LeadDetails> = {
  component: LeadDetails,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/leads/lead-1']}>
        <Routes>
          <Route path="/leads/:leadId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof LeadDetails>

export const Default: Story = {}

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/leads/:leadId', () => HttpResponse.json({ detail: 'Lead not found' }, { status: 404 })),
      ],
    },
  },
}
