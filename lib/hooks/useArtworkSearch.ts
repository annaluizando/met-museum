import { useInfiniteQuery } from '@tanstack/react-query'
import { searchArtworks, batchGetArtworks, getDepartments } from '@/lib/api/artworks'
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
 * Retries failed artwork fetches to improve reliability when filtering by department
 * Some artworks may fail due to transient network issues or API rate limits
 */
async function retryFailedArtworks(
  pageIds: number[],
  initialArtworks: (ArtworkObject | null)[]
): Promise<(ArtworkObject | null)[]> {
  const failedIds = pageIds.filter((_, index) => initialArtworks[index] === null)
  
  if (failedIds.length === 0) {
    return initialArtworks
  }

  const retryArtworks = await batchGetArtworks(failedIds)
  const retryMap = new Map(failedIds.map((id, index) => [id, retryArtworks[index]]))

  return pageIds.map((id, index) => {
    if (initialArtworks[index] === null && retryMap.has(id)) {
      return retryMap.get(id) ?? null
    }
    return initialArtworks[index]
  })
}

/**
 * Validates that artworks match the department filter
 * The API may occasionally return artworks from other departments, so we filter them client-side
 */
async function filterByDepartment(
  artworks: ArtworkObject[],
  departmentId?: number
): Promise<ArtworkObject[]> {
  if (!departmentId) {
    return artworks
  }

  try {
    const departmentsResponse = await getDepartments()
    const departmentMap = new Map(
      departmentsResponse.departments.map(dept => [dept.displayName, dept.departmentId])
    )

    return artworks.filter(artwork => {
      const artworkDepartmentId = departmentMap.get(artwork.department)
      return artworkDepartmentId === departmentId
    })
  } catch {
    return artworks
  }
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
    queryFn: async ({ pageParam = 0 }): Promise<{
      artworks: ArtworkObject[]
      nextOffset: number | undefined
      hasMore: boolean
    }> => {
      const searchResults = await searchArtworks(query, filters)
      
      if (!searchResults.objectIDs || searchResults.objectIDs.length === 0) {
        return {
          artworks: [],
          nextOffset: undefined,
          hasMore: false,
        }
      }

      const totalObjectIDs = searchResults.objectIDs.length
      const startIndex = pageParam
      const endIndex = Math.min(
        startIndex + PAGINATION.ITEMS_PER_PAGE,
        totalObjectIDs
      )
      
      const pageIds = searchResults.objectIDs.slice(startIndex, endIndex)
      let artworks = await batchGetArtworks(pageIds)
      artworks = await retryFailedArtworks(pageIds, artworks)
      
      const artworkMap = new Map<number, ArtworkObject>()
      artworks.forEach((artwork) => {
        if (artwork !== null && artwork.objectID != null) {
          artworkMap.set(artwork.objectID, artwork)
        }
      })

      const orderedArtworks = pageIds
        .map(id => artworkMap.get(id))
        .filter((artwork): artwork is ArtworkObject => 
          artwork != null && 
          artwork.objectID != null &&
          typeof artwork.objectID === 'number'
        )

      let filteredArtworks = filters?.hasImages === true
        ? orderedArtworks.filter(artwork => !!(artwork.primaryImage || artwork.primaryImageSmall))
        : orderedArtworks

      filteredArtworks = await filterByDepartment(filteredArtworks, filters?.departmentId)

      const hasMore = endIndex < totalObjectIDs

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
