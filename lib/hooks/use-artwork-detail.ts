import { useQuery } from '@tanstack/react-query'
import { getArtworkById } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'

/**
 * Custom hook for fetching artwork details
 */
export function useArtworkDetail(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.ARTWORKS.DETAIL(id!),
    queryFn: () => getArtworkById(id!),
    enabled: id !== null,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: REACT_QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
  })
}
