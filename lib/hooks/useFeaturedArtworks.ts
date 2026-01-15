import { useQuery } from '@tanstack/react-query'
import { batchGetArtworks } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'
import type { ArtworkObject } from '@/lib/types/artwork'

const FEATURED_ARTWORK_IDS = [
  436535, // Wheat Field with Cypresses (Vincent van Gogh)
  459055, // The Annunciation (Hans Memling)
  438817, // The Dance Class (Edgar Degas)
  436105, // The Death of Socrates (Jacques Louis David)
  436965, // The Monet Family in Their Garden at Argenteuil (Edouard Manet)
  436528, // Irises (Vincent van Gogh)
  437894, // Eugène Joseph Stanislas Foullon d'Ecotier (1753–1821) Antoine Vestier
  459080, // Erasmus of Rotterdam (Erasmus of Rotterdam)
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
    gcTime: REACT_QUERY_CONFIG.CACHE_TIME * 2,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
