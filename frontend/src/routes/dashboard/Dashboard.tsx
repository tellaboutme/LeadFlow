import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Flame, Plus, Users } from 'lucide-react'
import { useDashboardStats } from '@/api/dashboard'
import type { LeadPriority, LeadRead, LeadStatus } from '@/api/types'
import { ApiError } from '@/api/client'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { PriorityBadge } from '@/components/PriorityBadge'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'
import type { LeadBackState } from '@/lib/navigation'
import { PriorityChart } from './PriorityChart'

const FROM_DASHBOARD: LeadBackState = { backTo: '/', backLabel: 'Back to dashboard' }

const PRIORITY_RANK: Record<LeadPriority, number> = { urgent: 3, high: 2, medium: 1, low: 0 }
const STATUS_RANK: Record<LeadStatus, number> = { new: 0, contacted: 1, qualified: 2, won: 3, lost: 4 }

type RecentSort = 'newest' | 'priority' | 'status'

const SORT_OPTIONS: { value: RecentSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
]

function sortRecentLeads(leads: LeadRead[], sort: RecentSort): LeadRead[] {
  if (sort === 'newest') return leads
  const sorted = [...leads]
  if (sort === 'priority') {
    sorted.sort((a, b) => (b.priority ? PRIORITY_RANK[b.priority] : -1) - (a.priority ? PRIORITY_RANK[a.priority] : -1))
  } else {
    sorted.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
  }
  return sorted
}

export function Dashboard() {
  const navigate = useNavigate()
  const query = useDashboardStats()
  const [recentSort, setRecentSort] = useState<RecentSort>('newest')

  if (query.isPending) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={2} />
        <LoadingSkeleton rows={4} />
      </div>
    )
  }

  if (query.isError) {
    const description =
      query.error instanceof ApiError ? `Request failed (${query.error.status}).` : 'Could not reach the server.'
    return <ErrorState title="Failed to load dashboard" description={description} onRetry={() => query.refetch()} />
  }

  const stats = query.data

  if (stats.total === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No leads yet"
        description="Create your first lead to see stats and analysis here."
        actionLabel="New Lead"
        onAction={() => navigate('/leads/new')}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        actions={
          <Button onClick={() => navigate('/leads/new')}>
            <Plus className="size-4" aria-hidden />
            New Lead
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total leads" value={stats.total} icon={Users} onClick={() => navigate('/leads')} />
        <StatCard
          label="New"
          value={stats.new}
          icon={Plus}
          onClick={() => navigate('/leads?status=new')}
        />
        <StatCard
          label="High priority"
          value={stats.high_priority}
          icon={Flame}
          onClick={() => navigate('/leads?priority=high')}
        />
        <StatCard
          label="Won"
          value={stats.won}
          icon={CheckCircle2}
          onClick={() => navigate('/leads?status=won')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by priority</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityChart data={stats.by_priority} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent leads</CardTitle>
            <Select value={recentSort} onValueChange={(value) => setRecentSort(value as RecentSort)}>
              <SelectTrigger className="w-32" aria-label="Sort recent leads">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-1">
            {sortRecentLeads(stats.recent_leads, recentSort).map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => navigate(`/leads/${lead.id}`, { state: FROM_DASHBOARD })}
                className="flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.company ?? lead.email} · {formatDate(lead.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {lead.priority && <PriorityBadge priority={lead.priority} />}
                  <StatusBadge status={lead.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
