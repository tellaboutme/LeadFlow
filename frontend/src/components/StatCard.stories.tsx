import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckCircle2, Flame, TrendingUp, Users } from 'lucide-react'
import { StatCard } from './StatCard'

const meta: Meta<typeof StatCard> = { component: StatCard }
export default meta

type Story = StoryObj<typeof StatCard>

export const Total: Story = { args: { label: 'Total leads', value: 128, icon: Users } }
export const HighPriority: Story = { args: { label: 'High priority', value: 12, icon: Flame } }
export const Won: Story = { args: { label: 'Won', value: 34, icon: CheckCircle2 } }
export const ConversionRate: Story = {
  args: { label: 'Conversion rate', value: '26.6%', icon: TrendingUp },
}
