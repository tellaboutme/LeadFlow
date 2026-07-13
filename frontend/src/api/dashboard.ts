import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export const dashboardKey = ['dashboard', 'stats'] as const

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: async ({ signal }) => {
      const { data } = await api.GET('/api/v1/dashboard/stats', { signal })
      return data!
    },
  })
}
