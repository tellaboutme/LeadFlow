import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ErrorState } from './ErrorState'

const meta: Meta<typeof ErrorState> = { component: ErrorState }
export default meta

type Story = StoryObj<typeof ErrorState>

export const Default: Story = {
  args: {
    title: 'Failed to load leads',
    description: 'Check your connection and try again.',
    onRetry: fn(),
  },
}
