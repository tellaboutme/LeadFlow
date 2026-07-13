import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { fn } from 'storybook/test'
import { makeLead } from '@/mocks/leadFixtures'
import { LeadsTable } from './LeadsTable'

const meta: Meta<typeof LeadsTable> = {
  component: LeadsTable,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  args: {
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSortChange: fn(),
    onDelete: fn(),
  },
}
export default meta

type Story = StoryObj<typeof LeadsTable>

export const Normal: Story = {
  args: {
    leads: [
      makeLead({ id: '1', name: 'Alice Anderson', priority: 'high', status: 'new' }),
      makeLead({ id: '2', name: 'Bob Brown', priority: 'urgent', status: 'contacted', company: null }),
      makeLead({ id: '3', name: 'Carol Chen', priority: 'low', status: 'qualified' }),
    ],
  },
}

export const LongData: Story = {
  args: {
    leads: [
      makeLead({
        id: '1',
        name: 'Maximilian Alexander Wolfeschlegelsteinhausenbergerdorff-Smith',
        email: 'maximilian.alexander.wolfeschlegelsteinhausenbergerdorff@a-very-long-example-domain.com',
        company: 'International Consolidated Marketing and Web Development Agency Ltd.',
        category: 'Full-stack e-commerce platform migration and redesign',
        priority: 'urgent',
      }),
    ],
  },
}

export const Empty: Story = { args: { leads: [] } }
