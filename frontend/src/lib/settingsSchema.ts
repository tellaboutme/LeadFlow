import { z } from 'zod'

export const priorityValues = ['low', 'medium', 'high', 'urgent'] as const

export const settingsFormSchema = z.object({
  company_name: z.string().trim().max(160),
  telegram_enabled: z.boolean(),
  telegram_chat_id: z.string().trim().max(64),
  notify_min_priority: z.enum(priorityValues),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
