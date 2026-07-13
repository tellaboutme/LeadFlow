import type { LeadStatus } from '@/api/types'
import { Badge } from './ui/badge'

const LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
}

const CLASSNAMES: Record<LeadStatus, string> = {
  new: 'bg-status-new text-status-new-foreground',
  contacted: 'bg-status-contacted text-status-contacted-foreground',
  qualified: 'bg-status-qualified text-status-qualified-foreground',
  won: 'bg-status-won text-status-won-foreground',
  lost: 'bg-status-lost text-status-lost-foreground',
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge className={CLASSNAMES[status]}>{LABELS[status]}</Badge>
}
