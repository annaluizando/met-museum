'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * React Query provider with optimized configuration
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: REACT_QUERY_CONFIG.STALE_TIME,
            retry: REACT_QUERY_CONFIG.RETRY,
            refetchOnWindowFocus: REACT_QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
