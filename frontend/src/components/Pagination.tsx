import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

export function Pagination({
  total,
  limit,
  offset,
  onOffsetChange,
}: {
  total: number
  limit: number
  offset: number
  onOffsetChange: (offset: number) => void
}) {
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)
  const canPrev = offset > 0
  const canNext = offset + limit < total

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p aria-live="polite">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
