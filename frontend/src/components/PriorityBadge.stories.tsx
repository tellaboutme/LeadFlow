import type { Meta, StoryObj } from '@storybook/react-vite'
import { PriorityBadge } from './PriorityBadge'

const meta: Meta<typeof PriorityBadge> = {
  component: PriorityBadge,
  argTypes: {
    priority: { control: 'select', options: ['low', 'medium', 'high', 'urgent'] },
  },
}
export default meta

type Story = StoryObj<typeof PriorityBadge>

export const Low: Story = { args: { priority: 'low' } }
export const Medium: Story = { args: { priority: 'medium' } }
export const High: Story = { args: { priority: 'high' } }
export const Urgent: Story = { args: { priority: 'urgent' } }
