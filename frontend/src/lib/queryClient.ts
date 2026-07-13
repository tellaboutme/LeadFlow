import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status < 500) return false
          return failureCount < 2
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  })
}
