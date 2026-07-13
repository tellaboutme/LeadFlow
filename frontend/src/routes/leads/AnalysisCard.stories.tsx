import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { makeLead } from '@/mocks/leadFixtures'
import { AnalysisCard } from './AnalysisCard'

const meta: Meta<typeof AnalysisCard> = {
  component: AnalysisCard,
  args: { onReanalyze: fn(), isAnalyzing: false },
}
export default meta

type Story = StoryObj<typeof AnalysisCard>

export const NotRequested: Story = {
  args: { lead: makeLead({ analysis_status: 'not_requested', ai_summary: null, priority: null }) },
}

export const Pending: Story = {
  args: { lead: makeLead({ analysis_status: 'pending' }), isAnalyzing: true },
}

export const Completed: Story = {
  args: { lead: makeLead({ analysis_status: 'completed' }) },
}

export const Failed: Story = {
  args: {
    lead: makeLead({ analysis_status: 'failed', analysis_error: 'AI provider timed out.', ai_summary: null }),
  },
}
