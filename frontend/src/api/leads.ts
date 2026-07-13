import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { dashboardKey } from './dashboard'
import type { LeadCreate, LeadPriority, LeadSortField, LeadSource, LeadStatus, LeadUpdate, SortOrder } from './types'

export interface LeadListParams {
  search?: string
  status?: LeadStatus
  priority?: LeadPriority | 'none'
  source?: LeadSource
  sort_by?: LeadSortField
  sort_order?: SortOrder
  limit: number
  offset: number
}

export interface LeadExportParams {
  search?: string
  status?: LeadStatus
  priority?: LeadPriority | 'none'
  source?: LeadSource
  sort_by?: LeadSortField
  sort_order?: SortOrder
}

const leadsKey = {
  all: ['leads'] as const,
  list: (params: LeadListParams) => ['leads', 'list', params] as const,
  detail: (leadId: string) => ['leads', 'detail', leadId] as const,
}

export function useLeadsList(params: LeadListParams) {
  return useQuery({
    queryKey: leadsKey.list(params),
    queryFn: async ({ signal }) => {
      const { data } = await api.GET('/api/v1/leads', { params: { query: params }, signal })
      return data!
    },
    placeholderData: (previous) => previous,
  })
}

export function useLead(leadId: string | undefined) {
  return useQuery({
    queryKey: leadsKey.detail(leadId ?? ''),
    queryFn: async ({ signal }) => {
      const { data } = await api.GET('/api/v1/leads/{lead_id}', {
        params: { path: { lead_id: leadId! } },
        signal,
      })
      return data!
    },
    enabled: Boolean(leadId),
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ body, analyze }: { body: LeadCreate; analyze: boolean }) => {
      const { data } = await api.POST('/api/v1/leads', { params: { query: { analyze } }, body })
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKey.all })
      queryClient.invalidateQueries({ queryKey: dashboardKey })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, body }: { leadId: string; body: LeadUpdate }) => {
      const { data } = await api.PATCH('/api/v1/leads/{lead_id}', {
        params: { path: { lead_id: leadId } },
        body,
      })
      return data!
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadsKey.detail(lead.id), lead)
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: dashboardKey })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (leadId: string) => {
      await api.DELETE('/api/v1/leads/{lead_id}', { params: { path: { lead_id: leadId } } })
    },
    onSuccess: (_data, leadId) => {
      queryClient.removeQueries({ queryKey: leadsKey.detail(leadId) })
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: dashboardKey })
    },
  })
}

export function useAnalyzeLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data } = await api.POST('/api/v1/leads/{lead_id}/analyze', {
        params: { path: { lead_id: leadId } },
      })
      return data!
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadsKey.detail(lead.id), lead)
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: dashboardKey })
    },
  })
}

function filenameFromContentDisposition(header: string | null): string {
  const match = header ? /filename="?([^";]+)"?/.exec(header) : null
  return match?.[1] ?? 'leads-export.csv'
}

export function useExportLeadsCsv() {
  return useMutation({
    mutationFn: async (params: LeadExportParams) => {
      const { data, response } = await api.GET('/api/v1/leads/export', {
        params: { query: params },
        parseAs: 'blob',
      })
      return { blob: data as Blob, filename: filenameFromContentDisposition(response.headers.get('content-disposition')) }
    },
  })
}

export function useNotifyLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data } = await api.POST('/api/v1/leads/{lead_id}/notify', {
        params: { path: { lead_id: leadId } },
      })
      return data!
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadsKey.detail(lead.id), lead)
    },
  })
}
