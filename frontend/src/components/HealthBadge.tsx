import { CircleCheck, CircleX, LoaderCircle } from 'lucide-react'
import { useHealth } from '@/api/hooks'

export function HealthBadge() {
  const { data, isPending, isError } = useHealth()

  if (isPending) {
    return (
      <span
        role="status"
        aria-label="Checking backend..."
        className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm whitespace-nowrap text-secondary-foreground"
      >
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
        <span className="hidden sm:inline" aria-hidden>
          Checking backend...
        </span>
      </span>
    )
  }

  if (isError || data?.status !== 'ok') {
    return (
      <span
        role="status"
        aria-label="Backend unreachable"
        className="inline-flex items-center gap-1.5 rounded-full bg-priority-urgent px-2.5 py-1 text-sm whitespace-nowrap text-priority-urgent-foreground"
      >
        <CircleX className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline" aria-hidden>
          Backend unreachable
        </span>
      </span>
    )
  }

  return (
    <span
      role="status"
      aria-label={`Backend connected (${data.app_name} v${data.app_version})`}
      className="inline-flex items-center gap-1.5 rounded-full bg-status-won px-2.5 py-1 text-sm whitespace-nowrap text-status-won-foreground"
    >
      <CircleCheck className="size-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline" aria-hidden>
        Backend connected ({data.app_name} v{data.app_version})
      </span>
    </span>
  )
}
