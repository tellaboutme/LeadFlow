import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from './Dashboard'

const meta: Meta<typeof Dashboard> = {
  component: Dashboard,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
}
export default meta

type Story = StoryObj<typeof Dashboard>

export const Populated: Story = {}

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/dashboard/stats', () =>
          HttpResponse.json({
            total: 0,
            new: 0,
            high_priority: 0,
            urgent: 0,
            won: 0,
            conversion_rate: 0,
            by_priority: [
              { priority: 'low', count: 0 },
              { priority: 'medium', count: 0 },
              { priority: 'high', count: 0 },
              { priority: 'urgent', count: 0 },
            ],
            recent_leads: [],
          }),
        ),
      ],
    },
  },
}

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/dashboard/stats', () => HttpResponse.json({ detail: 'down' }, { status: 500 })),
      ],
    },
  },
}
