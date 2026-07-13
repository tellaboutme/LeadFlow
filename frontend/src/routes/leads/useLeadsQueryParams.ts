import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { LeadListParams } from '@/api/leads'
import type { LeadPriority, LeadSortField, LeadSource, LeadStatus, SortOrder } from '@/api/types'

const DEFAULT_LIMIT = 20

const STATUS_VALUES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost']
const PRIORITY_VALUES: Array<LeadPriority | 'none'> = ['low', 'medium', 'high', 'urgent', 'none']
const SOURCE_VALUES: LeadSource[] = ['website', 'email', 'telegram', 'referral', 'manual', 'other']
const SORT_FIELDS: LeadSortField[] = ['created_at', 'updated_at', 'name', 'priority', 'status']
const SORT_ORDERS: SortOrder[] = ['asc', 'desc']

function pick<T extends string>(value: string | null, allowed: T[]): T | undefined {
  return value && (allowed as string[]).includes(value) ? (value as T) : undefined
}

export interface LeadsFilters {
  search: string
  status?: LeadStatus
  priority?: LeadPriority | 'none'
  source?: LeadSource
  sort_by: LeadSortField
  sort_order: SortOrder
  offset: number
  limit: number
}

export function useLeadsQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<LeadsFilters>(
    () => ({
      search: searchParams.get('search') ?? '',
      status: pick(searchParams.get('status'), STATUS_VALUES),
      priority: pick(searchParams.get('priority'), PRIORITY_VALUES),
      source: pick(searchParams.get('source'), SOURCE_VALUES),
      sort_by: pick(searchParams.get('sort_by'), SORT_FIELDS) ?? 'created_at',
      sort_order: pick(searchParams.get('sort_order'), SORT_ORDERS) ?? 'desc',
      offset: Math.max(0, Number(searchParams.get('offset') ?? 0) || 0),
      limit: DEFAULT_LIMIT,
    }),
    [searchParams],
  )

  // Any filter change other than paging resets the offset to the first page.
  // Multiple keys are applied in one atomic update — calling setSearchParams
  // more than once per handler is a known react-router pitfall: each call's
  // `prev` is a stale snapshot from before the earlier call, so the later
  // `replace` silently overwrites the former (see toggleSort in LeadsList).
  const setFilters = useCallback(
    (updates: Partial<Record<keyof LeadsFilters, string | undefined>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          if (!('offset' in updates)) next.delete('offset')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setFilter = useCallback(
    (key: keyof LeadsFilters, value: string | undefined) => setFilters({ [key]: value }),
    [setFilters],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const listParams = useMemo<LeadListParams>(
    () => ({
      search: filters.search || undefined,
      status: filters.status,
      priority: filters.priority,
      source: filters.source,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  )

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.source,
  )

  return { filters, setFilter, setFilters, clearFilters, listParams, hasActiveFilters }
}
