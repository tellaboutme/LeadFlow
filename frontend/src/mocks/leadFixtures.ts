import type { LeadRead } from '@/api/types'

// Deterministic synthetic leads for tests and Storybook. No real personal data.
export function makeLead(overrides: Partial<LeadRead> = {}): LeadRead {
  return {
    id: 'lead-1',
    name: 'Alice Anderson',
    email: 'alice@example.com',
    company: 'Acme Web Co',
    source: 'website',
    budget_text: 'around $20k',
    deadline_text_input: 'within 2 months',
    description: 'We need a marketing website redesign with a CMS and blog.',
    status: 'new',
    priority: 'high',
    category: 'Web design',
    ai_summary: 'Established company seeking a marketing site redesign with CMS.',
    budget_min: 18000,
    budget_max: 22000,
    currency: 'USD',
    deadline_text: 'within 2 months',
    recommended_action: 'Schedule a scoping call this week.',
    tags: ['web', 'cms'],
    confidence: 0.82,
    analysis_reasons: ['Clear budget signal', 'Concrete deadline'],
    analysis_status: 'completed',
    analysis_error: null,
    ai_model: 'mock-model',
    prompt_version: 'v1',
    notification_status: 'sent',
    notification_error: null,
    last_notified_at: '2026-07-12T10:00:00Z',
    created_at: '2026-07-12T09:00:00Z',
    updated_at: '2026-07-12T10:00:00Z',
    ...overrides,
  }
}

export const sampleLeads: LeadRead[] = [
  makeLead({ id: 'lead-1', name: 'Alice Anderson', priority: 'high', status: 'new', source: 'website' }),
  makeLead({
    id: 'lead-2',
    name: 'Bob Brown',
    email: 'bob@example.com',
    company: 'Brown & Co',
    priority: 'urgent',
    status: 'contacted',
    source: 'referral',
    created_at: '2026-07-11T09:00:00Z',
  }),
  makeLead({
    id: 'lead-3',
    name: 'Carol Chen',
    email: 'carol@example.com',
    company: null,
    priority: 'low',
    status: 'qualified',
    source: 'email',
    analysis_status: 'not_requested',
    notification_status: 'not_required',
    ai_summary: null,
    created_at: '2026-07-10T09:00:00Z',
  }),
]
