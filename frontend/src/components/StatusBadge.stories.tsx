import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta: Meta<typeof StatusBadge> = {
  component: StatusBadge,
  argTypes: {
    status: { control: 'select', options: ['new', 'contacted', 'qualified', 'won', 'lost'] },
  },
}
export default meta

type Story = StoryObj<typeof StatusBadge>

export const New: Story = { args: { status: 'new' } }
export const Contacted: Story = { args: { status: 'contacted' } }
export const Qualified: Story = { args: { status: 'qualified' } }
export const Won: Story = { args: { status: 'won' } }
export const Lost: Story = { args: { status: 'lost' } }
