import { Send } from 'lucide-react'
import type { LeadRead } from '@/api/types'
import { NotificationStatusBadge } from '@/components/NotificationStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'

export function NotificationCard({
  lead,
  onSend,
  isSending,
}: {
  lead: LeadRead
  onSend: () => void
  isSending: boolean
}) {
  const status = isSending ? 'pending' : lead.notification_status

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Send className="size-4 text-primary" aria-hidden />
          Telegram notification
        </CardTitle>
        <div className="flex items-center gap-2">
          <NotificationStatusBadge status={status} />
          {status !== 'pending' && (
            <Button variant="outline" size="sm" onClick={onSend} disabled={isSending}>
              {lead.notification_status === 'sent' ? 'Resend' : 'Send now'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        {status === 'failed' && lead.notification_error && (
          <p className="text-destructive">{lead.notification_error}</p>
        )}
        {lead.last_notified_at ? (
          <p>Last sent {formatDateTime(lead.last_notified_at)}.</p>
        ) : (
          <p>No notification has been sent for this lead yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
