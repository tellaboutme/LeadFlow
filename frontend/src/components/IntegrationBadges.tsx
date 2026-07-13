import { useConfig } from '@/api/hooks'
import { providerBadgeClassName } from '@/lib/providerBadge'

export function IntegrationBadges() {
  const { data, isPending, isError } = useConfig()

  if (isPending || isError || !data) return null

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`rounded-full px-2 py-0.5 font-medium ${providerBadgeClassName(data.ai_provider)}`}>
        AI: {data.ai_provider}
      </span>
      <span className={`rounded-full px-2 py-0.5 font-medium ${providerBadgeClassName(data.telegram_provider)}`}>
        Telegram: {data.telegram_provider}
      </span>
    </div>
  )
}
