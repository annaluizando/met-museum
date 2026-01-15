import { useQuery } from '@tanstack/react-query'
import { getDepartments } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'

/**
 * Custom hook for fetching departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS.ALL,
    queryFn: getDepartments,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME * 2,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: false,
  })
}
