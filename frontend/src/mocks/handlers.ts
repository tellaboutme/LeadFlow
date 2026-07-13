import { http, HttpResponse } from 'msw'
import type {
  LeadCreate,
  LeadPriority,
  LeadRead,
  LeadStatus,
  LeadUpdate,
  PriorityBucket,
  SettingsRead,
  SettingsUpdate,
  TestTelegramRequest,
} from '@/api/types'
import { makeLead, sampleLeads } from './leadFixtures'

// Rank by declaration order (severity/pipeline), not alphabetically — must
// mirror the backend's LeadPriority/LeadStatus enum order (app/models/enums.py).
const PRIORITY_RANK: Record<LeadPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 }
const STATUS_RANK: Record<LeadStatus, number> = { new: 0, contacted: 1, qualified: 2, won: 3, lost: 4 }

// The `*` wildcard matches any origin, so these handlers work whether the
// request is relative (real browser, resolved against document location),
// absolute against a test stub origin, or served from Storybook's own port.
const API_BASE_URL = '*/api/v1'

// In-memory store so create/update/delete behave realistically within a
// session. Reset by tests via resetLeadStore() in beforeEach.
let store: LeadRead[] = sampleLeads.map((lead) => ({ ...lead }))

export function resetLeadStore(leads: LeadRead[] = sampleLeads) {
  store = leads.map((lead) => ({ ...lead }))
}

const defaultSettings: SettingsRead = {
  id: 1,
  company_name: null,
  telegram_chat_id: null,
  telegram_enabled: false,
  notify_min_priority: 'high',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

let settingsStore: SettingsRead = { ...defaultSettings }

export function resetSettingsStore(settings: SettingsRead = defaultSettings) {
  settingsStore = { ...settings }
}

export const handlers = [
  http.get(`${API_BASE_URL}/health`, () =>
    HttpResponse.json({ status: 'ok', app_name: 'LeadFlow AI', app_version: '0.1.0' }),
  ),
  http.get(`${API_BASE_URL}/meta/config`, () =>
    HttpResponse.json({
      app_name: 'LeadFlow AI',
      app_version: '0.1.0',
      environment: 'test',
      ai_provider: 'mock',
      telegram_provider: 'mock',
    }),
  ),

  http.get(`${API_BASE_URL}/settings`, () => HttpResponse.json(settingsStore)),

  http.patch(`${API_BASE_URL}/settings`, async ({ request }) => {
    const body = (await request.json()) as SettingsUpdate
    settingsStore = {
      ...settingsStore,
      company_name: body.company_name ?? settingsStore.company_name,
      telegram_chat_id: body.telegram_chat_id ?? settingsStore.telegram_chat_id,
      telegram_enabled: body.telegram_enabled ?? settingsStore.telegram_enabled,
      notify_min_priority: body.notify_min_priority ?? settingsStore.notify_min_priority,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(settingsStore)
  }),

  http.post(`${API_BASE_URL}/settings/test-telegram`, async ({ request }) => {
    const body = (await request.json()) as TestTelegramRequest
    if (!body.chat_id) {
      return HttpResponse.json({ ok: false, provider: 'mock', error: 'chat_id is required' })
    }
    return HttpResponse.json({ ok: true, provider: 'mock', error: null })
  }),

  http.get(`${API_BASE_URL}/leads/export`, () => {
    const header = 'ID,Name,Email\r\n'
    const rows = store.map((lead) => `${lead.id},${lead.name},${lead.email}`).join('\r\n')
    return new HttpResponse(header + rows, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="leads-export-test.csv"',
      },
    })
  }),

  http.get(`${API_BASE_URL}/leads`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams
    const search = q.get('search')?.toLowerCase()
    const status = q.get('status')
    const priority = q.get('priority')
    const source = q.get('source')
    const sortBy = (q.get('sort_by') ?? 'created_at') as keyof LeadRead
    const sortOrder = q.get('sort_order') ?? 'desc'
    const limit = Number(q.get('limit') ?? 20)
    const offset = Number(q.get('offset') ?? 0)

    let items = store.filter((lead) => {
      if (status && lead.status !== status) return false
      if (priority && lead.priority !== priority) return false
      if (source && lead.source !== source) return false
      if (search) {
        const haystack = [lead.name, lead.email, lead.company ?? ''].join(' ').toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })

    items = [...items].sort((a, b) => {
      let compared: number
      if (sortBy === 'priority') {
        compared = (a.priority ? PRIORITY_RANK[a.priority] : -1) - (b.priority ? PRIORITY_RANK[b.priority] : -1)
      } else if (sortBy === 'status') {
        compared = STATUS_RANK[a.status] - STATUS_RANK[b.status]
      } else {
        const left = String(a[sortBy] ?? '')
        const right = String(b[sortBy] ?? '')
        compared = left < right ? -1 : left > right ? 1 : 0
      }
      return sortOrder === 'asc' ? compared : -compared
    })

    const total = items.length
    items = items.slice(offset, offset + limit)
    return HttpResponse.json({ items, total, limit, offset })
  }),

  http.post(`${API_BASE_URL}/leads`, async ({ request }) => {
    const url = new URL(request.url)
    const analyze = url.searchParams.get('analyze') === 'true'
    const body = (await request.json()) as LeadCreate
    const lead = makeLead({
      id: `lead-${store.length + 1}`,
      name: body.name,
      email: body.email,
      company: body.company ?? null,
      source: body.source ?? 'manual',
      budget_text: body.budget_text ?? null,
      deadline_text_input: body.deadline_text_input ?? null,
      description: body.description,
      status: 'new',
      analysis_status: analyze ? 'completed' : 'not_requested',
      notification_status: analyze ? 'sent' : 'not_required',
      ai_summary: analyze ? 'Synthetic analysis summary.' : null,
      priority: analyze ? 'medium' : null,
    })
    store = [lead, ...store]
    return HttpResponse.json(lead, { status: 201 })
  }),

  http.get(`${API_BASE_URL}/leads/:leadId`, ({ params }) => {
    const lead = store.find((item) => item.id === params.leadId)
    if (!lead) return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 })
    return HttpResponse.json(lead)
  }),

  http.patch(`${API_BASE_URL}/leads/:leadId`, async ({ params, request }) => {
    const index = store.findIndex((item) => item.id === params.leadId)
    if (index === -1) return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 })
    const body = (await request.json()) as LeadUpdate
    const updated = { ...store[index], ...body, updated_at: new Date().toISOString() } as LeadRead
    store[index] = updated
    return HttpResponse.json(updated)
  }),

  http.delete(`${API_BASE_URL}/leads/:leadId`, ({ params }) => {
    const index = store.findIndex((item) => item.id === params.leadId)
    if (index === -1) return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 })
    store.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_BASE_URL}/leads/:leadId/analyze`, ({ params }) => {
    const index = store.findIndex((item) => item.id === params.leadId)
    if (index === -1) return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 })
    const updated: LeadRead = {
      ...store[index],
      analysis_status: 'completed',
      analysis_error: null,
      priority: store[index].priority ?? 'medium',
      ai_summary: 'Synthetic analysis summary.',
      updated_at: new Date().toISOString(),
    }
    store[index] = updated
    return HttpResponse.json(updated)
  }),

  http.post(`${API_BASE_URL}/leads/:leadId/notify`, ({ params }) => {
    const index = store.findIndex((item) => item.id === params.leadId)
    if (index === -1) return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 })
    const updated: LeadRead = {
      ...store[index],
      notification_status: 'sent',
      notification_error: null,
      last_notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    store[index] = updated
    return HttpResponse.json(updated)
  }),

  http.get(`${API_BASE_URL}/dashboard/stats`, () => {
    const total = store.length
    const won = store.filter((lead) => lead.status === 'won').length
    const byPriority: PriorityBucket[] = (['low', 'medium', 'high', 'urgent'] as LeadPriority[]).map(
      (priority) => ({
        priority,
        count: store.filter((lead) => lead.priority === priority).length,
      }),
    )
    const unclassified = store.filter((lead) => lead.priority == null).length
    if (unclassified) byPriority.push({ priority: 'unclassified', count: unclassified })

    const recentLeads = [...store]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 5)

    return HttpResponse.json({
      total,
      new: store.filter((lead) => lead.status === 'new').length,
      high_priority: store.filter((lead) => lead.priority === 'high').length,
      urgent: store.filter((lead) => lead.priority === 'urgent').length,
      won,
      conversion_rate: total ? Math.round((won / total) * 10000) / 10000 : 0,
      by_priority: byPriority,
      recent_leads: recentLeads,
    })
  }),
]
