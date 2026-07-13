import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteLead, useExportLeadsCsv, useLeadsList } from '@/api/leads'
import type { LeadRead, LeadSortField } from '@/api/types'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { downloadBlob } from '@/lib/downloadBlob'
import { FilterSelect } from './FilterSelect'
import { LeadsTable } from './LeadsTable'
import { SearchInput } from './SearchInput'
import { useLeadsQueryParams } from './useLeadsQueryParams'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'none', label: 'Unclassified' },
]
const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'referral', label: 'Referral' },
  { value: 'manual', label: 'Manual' },
  { value: 'other', label: 'Other' },
]

export function LeadsList() {
  const navigate = useNavigate()
  const { filters, setFilter, setFilters, clearFilters, listParams, hasActiveFilters } = useLeadsQueryParams()
  const query = useLeadsList(listParams)
  const deleteLead = useDeleteLead()
  const exportCsv = useExportLeadsCsv()
  const [pendingDelete, setPendingDelete] = useState<LeadRead | null>(null)

  function handleExport() {
    exportCsv.mutate(
      {
        search: filters.search || undefined,
        status: filters.status,
        priority: filters.priority,
        source: filters.source,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      },
      {
        onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
        onError: () => toast.error('Could not export leads. Try again.'),
      },
    )
  }

  function toggleSort(field: LeadSortField) {
    if (filters.sort_by === field) {
      setFilter('sort_order', filters.sort_order === 'desc' ? 'asc' : 'desc')
    } else {
      setFilters({ sort_by: field, sort_order: 'desc' })
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const lead = pendingDelete
    deleteLead.mutate(lead.id, {
      onSuccess: () => {
        toast.success(`Deleted ${lead.name}`)
        setPendingDelete(null)
      },
      onError: () => toast.error('Could not delete lead. Try again.'),
    })
  }

  const header = (
    <PageHeader
      title="Leads"
      description="Incoming leads and their qualification status."
      actions={
        <>
          <Button variant="outline" disabled={exportCsv.isPending} onClick={handleExport}>
            <Download className="size-4" aria-hidden />
            {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button onClick={() => navigate('/leads/new')}>
            <Plus className="size-4" aria-hidden />
            New Lead
          </Button>
        </>
      }
    />
  )

  const filterBar = (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.search}
        onDebouncedChange={(value) => setFilter('search', value || undefined)}
        isFetching={query.isFetching}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(value) => setFilter('status', value)}
      />
      <FilterSelect
        label="Priority"
        value={filters.priority}
        options={PRIORITY_OPTIONS}
        onChange={(value) => setFilter('priority', value)}
      />
      <FilterSelect
        label="Source"
        value={filters.source}
        options={SOURCE_OPTIONS}
        onChange={(value) => setFilter('source', value)}
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  )

  function renderBody() {
    if (query.isPending) return <LoadingSkeleton rows={6} />

    if (query.isError) {
      const description =
        query.error instanceof ApiError
          ? `Request failed (${query.error.status}).`
          : 'Could not reach the server.'
      return <ErrorState title="Failed to load leads" description={description} onRetry={() => query.refetch()} />
    }

    const { items, total, limit, offset } = query.data

    if (items.length === 0) {
      return hasActiveFilters ? (
        <EmptyState
          title="No leads match your filters"
          description="Try adjusting or clearing your search and filters."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Create your first lead to start qualifying with AI."
          actionLabel="New Lead"
          onAction={() => navigate('/leads/new')}
        />
      )
    }

    return (
      <div className="space-y-4">
        <LeadsTable
          leads={items}
          sortBy={filters.sort_by}
          sortOrder={filters.sort_order}
          onSortChange={toggleSort}
          onDelete={setPendingDelete}
        />
        <Pagination
          total={total}
          limit={limit}
          offset={offset}
          onOffsetChange={(next) => setFilter('offset', String(next))}
        />
      </div>
    )
  }

  return (
    <div>
      {header}
      {filterBar}
      {renderBody()}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete lead?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will be permanently removed. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        confirmDisabled={deleteLead.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
