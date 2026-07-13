import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingSkeleton } from './LoadingSkeleton'

const meta: Meta<typeof LoadingSkeleton> = { component: LoadingSkeleton }
export default meta

type Story = StoryObj<typeof LoadingSkeleton>

export const Default: Story = { args: { rows: 3 } }
export const SingleRow: Story = { args: { rows: 1 } }
