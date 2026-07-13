import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { PriorityChart } from './PriorityChart'

const meta: Meta<typeof PriorityChart> = {
  component: PriorityChart,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
}
export default meta

type Story = StoryObj<typeof PriorityChart>

export const Populated: Story = {
  args: {
    data: [
      { priority: 'low', count: 8 },
      { priority: 'medium', count: 5 },
      { priority: 'high', count: 12 },
      { priority: 'urgent', count: 3 },
    ],
  },
}

export const WithUnclassified: Story = {
  args: {
    data: [
      { priority: 'low', count: 4 },
      { priority: 'medium', count: 2 },
      { priority: 'high', count: 6 },
      { priority: 'urgent', count: 1 },
      { priority: 'unclassified', count: 9 },
    ],
  },
}

export const Empty: Story = {
  args: {
    data: [
      { priority: 'low', count: 0 },
      { priority: 'medium', count: 0 },
      { priority: 'high', count: 0 },
      { priority: 'urgent', count: 0 },
    ],
  },
}
