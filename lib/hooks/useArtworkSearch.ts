import { useInfiniteQuery } from '@tanstack/react-query'
import { searchArtworks, batchGetArtworks } from '@/lib/api/artworks'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { PAGINATION, REACT_QUERY_CONFIG } from '@/lib/constants/config'
import { hasActiveFilters } from '@/lib/utils/filters'
import type { SearchFilters, ArtworkObject } from '@/lib/types/artwork'
import type { SortOrder } from '@/lib/stores/search-store'

interface UseArtworkSearchOptions {
  query: string
  filters?: SearchFilters
  sortOrder?: SortOrder
  enabled?: boolean
}

/**
 * Custom hook for infinite scroll artwork search
 * Implements pagination with React Query's useInfiniteQuery
 */
export function useArtworkSearch({ 
  query, 
  filters, 
  sortOrder = 'relevance',
  enabled = true 
}: UseArtworkSearchOptions) {
  const hasQuery = query.trim().length > 0
  const hasFilters = hasActiveFilters(filters)
  const shouldEnable = hasQuery || hasFilters

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.ARTWORKS.INFINITE(query, filters, sortOrder),
    queryFn: async ({ pageParam = 0 }) => {
      const searchResults = await searchArtworks(query, filters)
      
      if (!searchResults.objectIDs || searchResults.objectIDs.length === 0) {
        return {
          artworks: [],
          nextOffset: undefined,
          hasMore: false,
        }
      }

      const startIndex = pageParam
      const endIndex = Math.min(
        startIndex + PAGINATION.ITEMS_PER_PAGE,
        searchResults.objectIDs.length
      )
      
      const pageIds = searchResults.objectIDs.slice(startIndex, endIndex)
      const artworks = await batchGetArtworks(pageIds)
      
      const artworkMap = new Map<number, ArtworkObject>()
      artworks.forEach((artwork) => {
        if (artwork !== null) {
          artworkMap.set(artwork.objectID, artwork)
        }
      })

      const orderedArtworks = pageIds
        .map(id => artworkMap.get(id))
        .filter((artwork): artwork is ArtworkObject => artwork !== null)

      const filteredArtworks = filters?.hasImages === true
        ? orderedArtworks.filter(artwork => !!(artwork.primaryImage || artwork.primaryImageSmall))
        : orderedArtworks

      const hasMore = endIndex < (searchResults.objectIDs?.length ?? 0)

      return {
        artworks: filteredArtworks,
        nextOffset: hasMore ? endIndex : undefined,
        hasMore,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: enabled && shouldEnable,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: REACT_QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
  })
}
