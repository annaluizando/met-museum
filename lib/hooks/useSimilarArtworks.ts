import { useQuery } from '@tanstack/react-query'
import { findSimilarArtworks } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'
import type { ArtworkObject } from '@/lib/types/artwork'

/**
 * Custom hook for fetching similar artworks
 */
export function useSimilarArtworks(artwork: ArtworkObject | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.ARTWORKS.SIMILAR(artwork?.objectID || 0),
    queryFn: () => findSimilarArtworks(artwork!),
    enabled: !!artwork,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: REACT_QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
  })
}
