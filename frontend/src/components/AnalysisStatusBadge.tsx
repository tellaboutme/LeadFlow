import { Ban, CircleCheck, CircleX, LoaderCircle } from 'lucide-react'
import type { AnalysisStatus } from '@/api/types'
import { Badge } from './ui/badge'

const CONFIG: Record<AnalysisStatus, { label: string; className: string; icon: typeof Ban }> = {
  // bg-muted/text-muted-foreground fails WCAG AA contrast at this size.
  not_requested: { label: 'Not requested', className: 'bg-secondary text-secondary-foreground', icon: Ban },
  pending: { label: 'Analyzing…', className: 'bg-priority-medium text-priority-medium-foreground', icon: LoaderCircle },
  completed: { label: 'Analyzed', className: 'bg-status-won text-status-won-foreground', icon: CircleCheck },
  failed: { label: 'Analysis failed', className: 'bg-priority-urgent text-priority-urgent-foreground', icon: CircleX },
}

export function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  const { label, className, icon: Icon } = CONFIG[status]
  return (
    <Badge className={`gap-1 ${className}`}>
      <Icon className={`size-3 ${status === 'pending' ? 'animate-spin' : ''}`} aria-hidden />
      {label}
    </Badge>
  )
}
