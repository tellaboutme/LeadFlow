import type { Meta, StoryObj } from '@storybook/react-vite'
import { NotificationStatusBadge } from './NotificationStatusBadge'

const meta: Meta<typeof NotificationStatusBadge> = {
  component: NotificationStatusBadge,
  argTypes: {
    status: { control: 'select', options: ['not_required', 'pending', 'sent', 'failed'] },
  },
}
export default meta

type Story = StoryObj<typeof NotificationStatusBadge>

export const NotRequired: Story = { args: { status: 'not_required' } }
export const Pending: Story = { args: { status: 'pending' } }
export const Sent: Story = { args: { status: 'sent' } }
export const Failed: Story = { args: { status: 'failed' } }
