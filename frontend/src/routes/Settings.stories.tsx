import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { Settings } from './Settings'

const meta: Meta<typeof Settings> = {
  component: Settings,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
}
export default meta

type Story = StoryObj<typeof Settings>

export const Default: Story = {}

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/settings', () => HttpResponse.json({ detail: 'down' }, { status: 500 })),
      ],
    },
  },
}
