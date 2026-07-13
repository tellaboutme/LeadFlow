import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from './ui/card'

const CARD_CLASSNAME =
  'flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]'

export function StatCard({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </>
  )

  if (!onClick) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3">{content}</CardContent>
      </Card>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View leads for ${label}: ${value}`}
      className={cn(
        CARD_CLASSNAME,
        'items-stretch text-left transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
      )}
    >
      <div className="flex items-center gap-3 px-(--card-spacing)">{content}</div>
    </button>
  )
}
