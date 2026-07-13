import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCreateLead } from '@/api/leads'
import type { LeadCreate } from '@/api/types'
import { ApiError } from '@/api/client'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DESCRIPTION_MAX_LENGTH,
  type LeadFormValues,
  leadFormDefaults,
  leadFormSchema,
  leadSourceValues,
} from '@/lib/leadSchema'

const SOURCE_LABELS: Record<(typeof leadSourceValues)[number], string> = {
  website: 'Website',
  email: 'Email',
  telegram: 'Telegram',
  referral: 'Referral',
  manual: 'Manual',
  other: 'Other',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export function LeadForm() {
  const navigate = useNavigate()
  const createLead = useCreateLead()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaults,
  })

  const descriptionLength = watch('description').length

  function onSubmit(values: LeadFormValues) {
    const body: LeadCreate = {
      name: values.name,
      email: values.email,
      company: values.company || null,
      source: values.source,
      budget_text: values.budget_text || null,
      deadline_text_input: values.deadline_text_input || null,
      description: values.description,
    }
    createLead.mutate(
      { body, analyze: values.analyze },
      {
        onSuccess: (lead) => {
          toast.success('Lead created')
          navigate(`/leads/${lead.id}`)
        },
        onError: (error) => {
          const message =
            error instanceof ApiError && error.status === 422
              ? 'The server rejected the submission. Check the fields and try again.'
              : 'Could not create the lead. Your entries were kept — try again.'
          toast.error(message)
        },
      },
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="New lead" description="Capture a lead and optionally run AI analysis." />

      <form noValidate className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="off" aria-invalid={Boolean(errors.name)} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" aria-invalid={Boolean(errors.company)} {...register('company')} />
            <FieldError message={errors.company?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <Controller
              control={control}
              name="source"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSourceValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {SOURCE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="budget_text">Budget</Label>
            <Input
              id="budget_text"
              placeholder="e.g. around $20k"
              aria-invalid={Boolean(errors.budget_text)}
              {...register('budget_text')}
            />
            <FieldError message={errors.budget_text?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline_text_input">Deadline</Label>
            <Input
              id="deadline_text_input"
              placeholder="e.g. within 2 months"
              aria-invalid={Boolean(errors.deadline_text_input)}
              {...register('deadline_text_input')}
            />
            <FieldError message={errors.deadline_text_input?.message} />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="description"
            rows={6}
            aria-invalid={Boolean(errors.description)}
            {...register('description')}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label htmlFor="analyze">Run AI analysis</Label>
            <p className="text-xs text-muted-foreground">
              Classify priority, budget and category right after saving.
            </p>
          </div>
          <Controller
            control={control}
            name="analyze"
            render={({ field }) => (
              <Switch id="analyze" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || createLead.isPending}>
            {createLead.isPending ? 'Creating…' : 'Create lead'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/leads')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
