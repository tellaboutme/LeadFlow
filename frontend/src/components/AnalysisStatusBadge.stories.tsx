import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnalysisStatusBadge } from './AnalysisStatusBadge'

const meta: Meta<typeof AnalysisStatusBadge> = {
  component: AnalysisStatusBadge,
  argTypes: {
    status: { control: 'select', options: ['not_requested', 'pending', 'completed', 'failed'] },
  },
}
export default meta

type Story = StoryObj<typeof AnalysisStatusBadge>

export const NotRequested: Story = { args: { status: 'not_requested' } }
export const Pending: Story = { args: { status: 'pending' } }
export const Completed: Story = { args: { status: 'completed' } }
export const Failed: Story = { args: { status: 'failed' } }
