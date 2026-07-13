import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { expect, userEvent, within } from 'storybook/test'
import { LeadForm } from './LeadForm'

const meta: Meta<typeof LeadForm> = {
  component: LeadForm,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
}
export default meta

type Story = StoryObj<typeof LeadForm>

export const Default: Story = {}

export const WithValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /create lead/i }))
    await expect(canvas.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByLabelText('Description')).toHaveAttribute('aria-invalid', 'true')
  },
}
