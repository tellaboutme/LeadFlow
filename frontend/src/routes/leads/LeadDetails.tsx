import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAnalyzeLead,
  useDeleteLead,
  useLead,
  useNotifyLead,
  useUpdateLead,
} from '@/api/leads'
import type { LeadStatus } from '@/api/types'
import { ApiError } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { CopyButton } from '@/components/CopyButton'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDateTime } from '@/lib/format'
import { DEFAULT_LEAD_BACK, type LeadBackState } from '@/lib/navigation'
import { AnalysisCard } from './AnalysisCard'
import { NotificationCard } from './NotificationCard'

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export function LeadDetails() {
  const { leadId } = useParams<{ leadId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const back = (location.state as LeadBackState | null) ?? DEFAULT_LEAD_BACK
  const query = useLead(leadId)
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const analyzeLead = useAnalyzeLead()
  const notifyLead = useNotifyLead()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (query.isPending) {
    return (
      <div className="max-w-3xl space-y-4">
        <LoadingSkeleton rows={2} />
        <LoadingSkeleton rows={4} />
      </div>
    )
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404
    return (
      <div className="max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(back.backTo)}>
          <ArrowLeft className="size-4" aria-hidden />
          {back.backLabel}
        </Button>
        <ErrorState
          title={notFound ? 'Lead not found' : 'Failed to load lead'}
          description={
            notFound
              ? 'This lead may have been deleted.'
              : 'Could not reach the server. Try again.'
          }
          onRetry={notFound ? undefined : () => query.refetch()}
        />
      </div>
    )
  }

  const lead = query.data

  function changeStatus(status: LeadStatus) {
    updateLead.mutate(
      { leadId: lead.id, body: { status } },
      {
        onSuccess: () => toast.success('Status updated'),
        onError: () => toast.error('Could not update status.'),
      },
    )
  }

  function reanalyze() {
    analyzeLead.mutate(lead.id, {
      onError: () => toast.error('Analysis request failed.'),
    })
  }

  function sendNotification() {
    notifyLead.mutate(lead.id, {
      onSuccess: (updated) =>
        updated.notification_status === 'sent'
          ? toast.success('Notification sent')
          : toast.error('Notification could not be delivered.'),
      onError: () => toast.error('Notification request failed.'),
    })
  }

  function handleDelete() {
    deleteLead.mutate(lead.id, {
      onSuccess: () => {
        toast.success('Lead deleted')
        navigate(back.backTo)
      },
      onError: () => {
        toast.error('Could not delete lead.')
        setConfirmDelete(false)
      },
    })
  }

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(back.backTo)}>
        <ArrowLeft className="size-4" aria-hidden />
        {back.backLabel}
      </Button>

      <PageHeader
        title={lead.name}
        actions={
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Contact & request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="flex items-center gap-1 text-sm text-foreground">
                  <span className="truncate">{lead.email}</span>
                  <CopyButton value={lead.email} label="Copy email" />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Company</dt>
                <dd className="text-sm text-foreground">{lead.company ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="text-sm text-foreground capitalize">{lead.source}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Priority</dt>
                <dd className="text-sm">
                  {lead.priority ? <PriorityBadge priority={lead.priority} /> : '—'}
                </dd>
              </div>
            </dl>

            <div>
              <p className="text-xs text-muted-foreground">Original request</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{lead.description}</p>
            </div>

            <div className="grid gap-2 sm:max-w-xs">
              <Label htmlFor="status">Status</Label>
              <Select
                value={lead.status}
                onValueChange={(value) => changeStatus(value as LeadStatus)}
                disabled={updateLead.isPending}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <AnalysisCard lead={lead} onReanalyze={reanalyze} isAnalyzing={analyzeLead.isPending} />
        <NotificationCard lead={lead} onSend={sendNotification} isSending={notifyLead.isPending} />

        <p className="text-xs text-muted-foreground">
          Created {formatDateTime(lead.created_at)} · Updated {formatDateTime(lead.updated_at)}
        </p>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete lead?"
        description={`${lead.name} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        confirmDisabled={deleteLead.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
