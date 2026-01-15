import { useQuery } from '@tanstack/react-query'
import { batchGetArtworks } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'
import type { ArtworkObject } from '@/lib/types/artwork'

/**
 * Curated list of famous artworks from the Met Museum
 * These are well-known pieces with high-quality images
 * Using a stable, pre-shuffled list to ensure consistent caching
 */
const FEATURED_ARTWORK_IDS = [
  436535, // The Great Wave
  459055, // Bridge Over a Pond of Water Lilies (Monet)
  438817, // Self-Portrait with a Straw Hat (Van Gogh)
  436105, // Wheat Field with Cypresses (Van Gogh)
  437133, // Irises (Van Gogh)
  436528, // A Pair of Leather Clogs (Van Gogh)
  437894, // Virgin and Child (Duccio)
  459080, // Water Lilies (Monet)
]

/**
 * Custom hook for fetching featured artworks
 * Uses React Query for caching to prevent unnecessary API requests
 */
export function useFeaturedArtworks() {
  return useQuery({
    queryKey: QUERY_KEYS.ARTWORKS.FEATURED,
    queryFn: async () => {
      const fetchedArtworks = await batchGetArtworks(FEATURED_ARTWORK_IDS)
      const validArtworks = fetchedArtworks.filter(
        (artwork): artwork is ArtworkObject => artwork !== null
      )
      return validArtworks
    },
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    // Featured artworks are relatively static, so use longer cache time
    gcTime: REACT_QUERY_CONFIG.CACHE_TIME * 2, // 20 minutes
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: false, // Never refetch on focus for featured artworks
    refetchOnMount: false, // Don't refetch if data exists in cache
  })
}
