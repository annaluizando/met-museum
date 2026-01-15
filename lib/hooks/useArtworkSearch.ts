import { useInfiniteQuery } from '@tanstack/react-query'
import { searchArtworks, batchGetArtworks } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { PAGINATION, REACT_QUERY_CONFIG } from '@/lib/constants/config'
import type { SearchFilters, ArtworkObject } from '@/lib/types/artwork'

interface UseArtworkSearchOptions {
  query: string
  filters?: SearchFilters
  enabled?: boolean
}

/**
 * Custom hook for infinite scroll artwork search
 * Implements pagination with React Query's useInfiniteQuery
 */
export function useArtworkSearch({ 
  query, 
  filters, 
  enabled = true 
}: UseArtworkSearchOptions) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.ARTWORKS.INFINITE(query, filters),
    queryFn: async ({ pageParam = 0 }) => {
      // If no query, return empty results
      if (!query.trim()) {
        return {
          artworks: [],
          nextOffset: undefined,
          hasMore: false,
        }
      }

      // Search for artwork IDs
      const searchResults = await searchArtworks(query, filters)
      
      if (!searchResults.objectIDs || searchResults.objectIDs.length === 0) {
        return {
          artworks: [],
          nextOffset: undefined,
          hasMore: false,
        }
      }

      // Calculate pagination
      const startIndex = pageParam
      const endIndex = Math.min(
        startIndex + PAGINATION.ITEMS_PER_PAGE,
        searchResults.objectIDs.length
      )
      
      const pageIds = searchResults.objectIDs.slice(startIndex, endIndex)
      
      // Batch fetch artwork details
      const artworks = await batchGetArtworks(pageIds)
      
      // Filter out null results (failed fetches)
      const validArtworks = artworks.filter(
        (artwork): artwork is ArtworkObject => artwork !== null
      )

      // Sort artworks: those with images first, then those without
      // Only sort if hasImages filter is not explicitly set (allows users to filter if they want)
      const sortedArtworks = filters?.hasImages === undefined
        ? validArtworks.sort((a, b) => {
            const aHasImage = !!(a.primaryImage || a.primaryImageSmall)
            const bHasImage = !!(b.primaryImage || b.primaryImageSmall)
            
            // If both have images or both don't, maintain original order
            if (aHasImage === bHasImage) return 0
            if (aHasImage && !bHasImage) return -1
            return 1
          })
        : validArtworks

      const hasMore = endIndex < searchResults.objectIDs.length

      return {
        artworks: sortedArtworks,
        nextOffset: hasMore ? endIndex : undefined,
        hasMore,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: enabled && query.trim().length > 0,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: REACT_QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
  })
}
