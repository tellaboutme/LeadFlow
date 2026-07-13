import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'

function Placeholder() {
  return <p className="text-sm text-muted-foreground">Page content</p>
}

const meta: Meta<typeof AppShell> = {
  component: AppShell,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Story />}>
            <Route index element={<Placeholder />} />
          </Route>
        </Routes>
      </MemoryRouter>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof AppShell>

export const Desktop: Story = {
  parameters: { viewport: { value: { width: '1440px', height: '900px' } } },
}

export const Mobile: Story = {
  parameters: { viewport: { value: { width: '375px', height: '812px' } } },
}
