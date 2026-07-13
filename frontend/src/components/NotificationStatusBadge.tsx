import { Ban, CircleCheck, CircleX, LoaderCircle } from 'lucide-react'
import type { NotificationStatus } from '@/api/types'
import { Badge } from './ui/badge'

const CONFIG: Record<NotificationStatus, { label: string; className: string; icon: typeof Ban }> = {
  // bg-muted/text-muted-foreground fails WCAG AA contrast at this size.
  not_required: { label: 'Not required', className: 'bg-secondary text-secondary-foreground', icon: Ban },
  pending: { label: 'Sending…', className: 'bg-priority-medium text-priority-medium-foreground', icon: LoaderCircle },
  sent: { label: 'Sent', className: 'bg-status-won text-status-won-foreground', icon: CircleCheck },
  failed: { label: 'Send failed', className: 'bg-priority-urgent text-priority-urgent-foreground', icon: CircleX },
}

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
  const { label, className, icon: Icon } = CONFIG[status]
  return (
    <Badge className={`gap-1 ${className}`}>
      <Icon className={`size-3 ${status === 'pending' ? 'animate-spin' : ''}`} aria-hidden />
      {label}
    </Badge>
  )
}
