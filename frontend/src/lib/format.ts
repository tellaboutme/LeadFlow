import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { LeadRead } from '@/api/types'

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'PP p')
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'PP')
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

export function formatBudget(lead: Pick<LeadRead, 'budget_min' | 'budget_max' | 'currency' | 'budget_text'>): string {
  const { budget_min, budget_max, currency } = lead
  if (budget_min == null && budget_max == null) return lead.budget_text ?? '—'

  const symbol = currency ? `${currency} ` : ''
  const fmt = (value: number) => `${symbol}${value.toLocaleString()}`

  if (budget_min != null && budget_max != null) {
    return budget_min === budget_max ? fmt(budget_min) : `${fmt(budget_min)}–${fmt(budget_max)}`
  }
  return fmt((budget_min ?? budget_max)!)
}
