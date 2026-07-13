import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { makeLead } from '@/mocks/leadFixtures'
import { NotificationCard } from './NotificationCard'

const meta: Meta<typeof NotificationCard> = {
  component: NotificationCard,
  args: { onSend: fn(), isSending: false },
}
export default meta

type Story = StoryObj<typeof NotificationCard>

export const NotRequired: Story = {
  args: { lead: makeLead({ notification_status: 'not_required', last_notified_at: null }) },
}

export const Pending: Story = {
  args: { lead: makeLead({ notification_status: 'pending' }), isSending: true },
}

export const Sent: Story = {
  args: { lead: makeLead({ notification_status: 'sent' }) },
}

export const Failed: Story = {
  args: {
    lead: makeLead({
      notification_status: 'failed',
      notification_error: 'Telegram API rejected the request.',
      last_notified_at: null,
    }),
  },
}
