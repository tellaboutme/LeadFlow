import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { SettingsUpdate, TestTelegramRequest } from './types'

export const settingsKey = ['settings'] as const

export function useSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: async ({ signal }) => {
      const { data } = await api.GET('/api/v1/settings', { signal })
      return data!
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: SettingsUpdate) => {
      const { data } = await api.PATCH('/api/v1/settings', { body })
      return data!
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKey, settings)
    },
  })
}

export function useTestTelegram() {
  return useMutation({
    mutationFn: async (body: TestTelegramRequest) => {
      const { data } = await api.POST('/api/v1/settings/test-telegram', { body })
      return data!
    },
  })
}
