import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, Plug, SendHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useSettings, useTestTelegram, useUpdateSettings } from '@/api/settings'
import { useConfig } from '@/api/hooks'
import { ApiError } from '@/api/client'
import type { SettingsRead } from '@/api/types'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { providerBadgeClassName } from '@/lib/providerBadge'
import { type SettingsFormValues, priorityValues, settingsFormSchema } from '@/lib/settingsSchema'

const PRIORITY_LABELS: Record<(typeof priorityValues)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

function formValuesFrom(settings: SettingsRead): SettingsFormValues {
  return {
    company_name: settings.company_name ?? '',
    telegram_enabled: settings.telegram_enabled,
    telegram_chat_id: settings.telegram_chat_id ?? '',
    notify_min_priority: settings.notify_min_priority,
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

function SettingsForm({ settings }: { settings: SettingsRead }) {
  const updateSettings = useUpdateSettings()
  const testTelegram = useTestTelegram()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: formValuesFrom(settings),
  })

  useEffect(() => {
    reset(formValuesFrom(settings))
  }, [settings, reset])

  const chatId = watch('telegram_chat_id')

  function onSubmit(values: SettingsFormValues) {
    updateSettings.mutate(
      {
        company_name: values.company_name || null,
        telegram_enabled: values.telegram_enabled,
        telegram_chat_id: values.telegram_chat_id || null,
        notify_min_priority: values.notify_min_priority,
      },
      {
        onSuccess: () => toast.success('Settings saved'),
        onError: () => toast.error('Could not save settings. Try again.'),
      },
    )
  }

  function runTestTelegram() {
    testTelegram.mutate(
      { chat_id: chatId || undefined },
      {
        onSuccess: (result) => {
          if (result.ok) toast.success(`Test message sent via ${result.provider}`)
          else toast.error(result.error ?? 'Telegram test failed')
        },
        onError: () => toast.error('Could not reach the Telegram test endpoint.'),
      },
    )
  }

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="company_name">Company name</Label>
        <Input
          id="company_name"
          aria-invalid={Boolean(errors.company_name)}
          {...register('company_name')}
        />
        <FieldError message={errors.company_name?.message} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <Label htmlFor="telegram_enabled">Telegram notifications</Label>
          <p className="text-xs text-muted-foreground">
            Send a Telegram message when a lead meets the priority threshold below.
          </p>
        </div>
        <Controller
          control={control}
          name="telegram_enabled"
          render={({ field }) => (
            <Switch id="telegram_enabled" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="telegram_chat_id">Telegram chat ID</Label>
          <Input
            id="telegram_chat_id"
            autoComplete="off"
            aria-invalid={Boolean(errors.telegram_chat_id)}
            {...register('telegram_chat_id')}
          />
          <FieldError message={errors.telegram_chat_id?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notify_min_priority">Minimum priority to notify</Label>
          <Controller
            control={control}
            name="notify_min_priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="notify_min_priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PRIORITY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!isDirty || updateSettings.isPending}>
          {updateSettings.isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={testTelegram.isPending}
          onClick={runTestTelegram}
        >
          <SendHorizontal className="size-4" aria-hidden />
          {testTelegram.isPending ? 'Sending test…' : 'Send test message'}
        </Button>
      </div>
    </form>
  )
}

function IntegrationStatus() {
  const config = useConfig()

  if (config.isPending) return <LoadingSkeleton rows={2} />
  if (config.isError) return <ErrorState title="Could not load integration status" onRetry={() => config.refetch()} />

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-border p-3">
        <dt className="text-xs text-muted-foreground">Environment</dt>
        <dd className="mt-1 text-sm font-medium text-foreground">{config.data.environment}</dd>
      </div>
      <div className="rounded-lg border border-border p-3">
        <dt className="text-xs text-muted-foreground">App version</dt>
        <dd className="mt-1 text-sm font-medium text-foreground">{config.data.app_version}</dd>
      </div>
      <div className="rounded-lg border border-border p-3">
        <dt className="text-xs text-muted-foreground">AI provider</dt>
        <dd className="mt-1">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${providerBadgeClassName(config.data.ai_provider)}`}
          >
            {config.data.ai_provider}
          </span>
        </dd>
      </div>
      <div className="rounded-lg border border-border p-3">
        <dt className="text-xs text-muted-foreground">Telegram provider</dt>
        <dd className="mt-1">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${providerBadgeClassName(config.data.telegram_provider)}`}
          >
            {config.data.telegram_provider}
          </span>
        </dd>
      </div>
    </dl>
  )
}

export function Settings() {
  const settings = useSettings()

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Company details, notification thresholds and integrations." />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" aria-hidden />
            Notifications
          </CardTitle>
          <CardDescription>Company details and Telegram alert thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="pt-(--card-spacing)">
          {settings.isPending ? (
            <LoadingSkeleton rows={4} />
          ) : settings.isError ? (
            <ErrorState
              title="Failed to load settings"
              description={
                settings.error instanceof ApiError ? `Request failed (${settings.error.status}).` : undefined
              }
              onRetry={() => settings.refetch()}
            />
          ) : (
            <SettingsForm settings={settings.data} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-4 text-muted-foreground" aria-hidden />
            Integration status
          </CardTitle>
          <CardDescription>Read-only — set via environment variables, not this page.</CardDescription>
        </CardHeader>
        <CardContent className="pt-(--card-spacing)">
          <IntegrationStatus />
        </CardContent>
      </Card>
    </div>
  )
}
