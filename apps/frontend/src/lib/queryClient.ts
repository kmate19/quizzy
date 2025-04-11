import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
        staleTime: 60 * 15 * 1000, 
        refetchInterval: 60 * 15 * 1000,
        gcTime: 60 * 30 * 1000,
    },
  },
})