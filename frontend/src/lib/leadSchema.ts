import { z } from 'zod'

export const leadSourceValues = ['website', 'email', 'telegram', 'referral', 'manual', 'other'] as const

export const leadFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(254).email(),
  company: z.string().trim().max(160),
  source: z.enum(leadSourceValues),
  budget_text: z.string().trim().max(160),
  deadline_text_input: z.string().trim().max(160),
  description: z.string().trim().min(20).max(5000),
  analyze: z.boolean(),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>

export const leadFormDefaults: LeadFormValues = {
  name: '',
  email: '',
  company: '',
  source: 'manual',
  budget_text: '',
  deadline_text_input: '',
  description: '',
  analyze: true,
}

export const DESCRIPTION_MAX_LENGTH = 5000
