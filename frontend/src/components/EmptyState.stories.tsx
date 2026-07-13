import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = { component: EmptyState }
export default meta

type Story = StoryObj<typeof EmptyState>

export const NoData: Story = {
  args: {
    title: 'No leads yet',
    description: 'Leads you create will show up here.',
    actionLabel: 'New lead',
    onAction: fn(),
  },
}

export const NoFilterResults: Story = {
  args: {
    title: 'No leads match your filters',
    description: 'Try clearing search or status filters.',
  },
}
