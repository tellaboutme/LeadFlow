import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async ({ signal }) => {
      const { data } = await api.GET('/api/v1/health', { signal })
      return data!
    },
  })
}

export function useConfig() {
  return useQuery({
    queryKey: ['meta', 'config'],
    queryFn: async ({ signal }) => {
      const { data } = await api.GET('/api/v1/meta/config', { signal })
      return data!
    },
    staleTime: 5 * 60 * 1000,
  })
}
