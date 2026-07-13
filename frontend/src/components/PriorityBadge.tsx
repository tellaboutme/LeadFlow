import type { LeadPriority } from '@/api/types'
import { Badge } from './ui/badge'

const LABELS: Record<LeadPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const CLASSNAMES: Record<LeadPriority, string> = {
  low: 'bg-priority-low text-priority-low-foreground',
  medium: 'bg-priority-medium text-priority-medium-foreground',
  high: 'bg-priority-high text-priority-high-foreground',
  urgent: 'bg-priority-urgent text-priority-urgent-foreground',
}

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return <Badge className={CLASSNAMES[priority]}>{LABELS[priority]}</Badge>
}
