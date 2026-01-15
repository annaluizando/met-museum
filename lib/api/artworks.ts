import { fetchApi, MetApiError } from './client'
import { ERROR_MESSAGES } from '@/lib/constants/config'
import { hasActiveFilters } from '@/lib/utils/filters'
import type {
  ArtworkObject,
  SearchResponse,
  SearchFilters,
  DepartmentsResponse,
} from '@/lib/types/artwork'
import { searchQuerySchema, searchFiltersSchema } from '@/lib/validations/search'
import { sanitizeSearchQuery } from '@/lib/utils/sanitize'

/**
 * Search for artworks with optional filters
 * The Met Museum API searches across all metadata fields (title, artist, culture, etc.)
 */
export async function searchArtworks(
  query: string,
  filters?: SearchFilters
): Promise<SearchResponse> {
  const sanitizedQuery = sanitizeSearchQuery(query)
  const queryResult = searchQuerySchema.safeParse(sanitizedQuery)
  
  if (!queryResult.success) {
    console.error('Search query validation failed:', {
      originalQuery: query,
      sanitizedQuery,
      validationErrors: queryResult.error.issues,
      errorCount: queryResult.error.issues.length,
    })
    throw new MetApiError(ERROR_MESSAGES.GENERIC)
  }
  
  let validatedFilters: SearchFilters | undefined
  if (filters) {
    const filtersResult = searchFiltersSchema.safeParse(filters)
    if (filtersResult.success) {
      validatedFilters = filtersResult.data
    } else {
      validatedFilters = undefined
    }
  }
  
  const hasQuery = queryResult.data && queryResult.data.length > 0
  const hasFilters = hasActiveFilters(validatedFilters)
  
  if (!hasQuery && !hasFilters) {
    throw new MetApiError(ERROR_MESSAGES.BAD_REQUEST)
  }
  
  const params = new URLSearchParams()
  if (hasQuery) {
    params.append('q', queryResult.data)
  } else if (hasFilters) {
    params.append('q', 'a')
  }
  if (validatedFilters?.departmentId) {
    params.append('departmentId', validatedFilters.departmentId.toString())
  }
  if (validatedFilters?.isHighlight !== undefined) {
    params.append('isHighlight', validatedFilters.isHighlight.toString())
  }
  if (validatedFilters?.isOnView !== undefined) {
    params.append('isOnView', validatedFilters.isOnView.toString())
  }
  if (validatedFilters?.medium) {
    params.append('medium', validatedFilters.medium)
  }
  if (validatedFilters?.geoLocation) {
    params.append('geoLocation', validatedFilters.geoLocation)
  }
  
  if (validatedFilters?.dateBegin !== undefined || validatedFilters?.dateEnd !== undefined) {
    let dateBegin: number
    let dateEnd: number
    
    if (validatedFilters.dateBegin !== undefined && validatedFilters.dateEnd !== undefined) {
      dateBegin = validatedFilters.dateBegin
      dateEnd = validatedFilters.dateEnd
    } else if (validatedFilters.dateBegin !== undefined) {
      dateBegin = validatedFilters.dateBegin
      dateEnd = new Date().getFullYear()
    } else {
      dateBegin = -5000
      dateEnd = validatedFilters.dateEnd!
    }
    
    params.append('dateBegin', dateBegin.toString())
    params.append('dateEnd', dateEnd.toString())
  }

  return fetchApi<SearchResponse>(`/search?${params.toString()}`)
}

export async function getArtworkById(id: number): Promise<ArtworkObject> {
  if (!Number.isInteger(id) || id <= 0) {
    console.error('Invalid artwork ID:', {
      id,
      type: typeof id,
      isInteger: Number.isInteger(id),
      isPositive: id > 0,
    })
    throw new MetApiError(ERROR_MESSAGES.GENERIC)
  }
  
  return fetchApi<ArtworkObject>(`/objects/${id}`)
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<DepartmentsResponse> {
  return fetchApi<DepartmentsResponse>('/departments')
}

/**
 * Batch fetch multiple artworks by IDs
 * Useful for loading multiple artwork cards at once
 */
export async function batchGetArtworks(
  ids: number[]
): Promise<(ArtworkObject | null)[]> {
  const validIds = ids.filter(id => Number.isInteger(id) && id > 0)
  
  if (validIds.length === 0) {
    return []
  }
  
  const promises = validIds.map(id =>
    getArtworkById(id).catch(() => null)
  )
  
  return Promise.all(promises)
}

/**
 * Find similar artworks based on multiple criteria
 * Uses multiple search strategies and combines results
 */
const addSearchResultsToSet = (
  objectIDs: number[] | null | undefined,
  similarIds: Set<number>,
  excludeId: number,
  maxToAdd: number
): void => {
  if (!objectIDs) return

  objectIDs
    .filter(id => id !== excludeId && !similarIds.has(id))
    .slice(0, maxToAdd)
    .forEach(id => similarIds.add(id))
}

const searchAndAddResults = async (
  query: string,
  filters: SearchFilters | undefined,
  similarIds: Set<number>,
  excludeId: number,
  maxToAdd: number,
  strategyName: string
): Promise<void> => {
  try {
    const results = await searchArtworks(query, filters)
    const objectIDs = results.objectIDs ?? undefined
    addSearchResultsToSet(objectIDs, similarIds, excludeId, maxToAdd)
  } catch (error) {
    console.error(`Error searching by ${strategyName}:`, error)
  }
}

export async function findSimilarArtworks(
  artwork: ArtworkObject,
  limit: number = 12
): Promise<ArtworkObject[]> {
  const similarIds = new Set<number>()
  const excludeId = artwork.objectID

  if (artwork.artistDisplayName) {
    await searchAndAddResults(
      artwork.artistDisplayName,
      { hasImages: true },
      similarIds,
      excludeId,
      limit,
      'artist'
    )
  }

  if (artwork.department && artwork.culture && similarIds.size < limit) {
    await searchAndAddResults(
      artwork.culture,
      { hasImages: true },
      similarIds,
      excludeId,
      limit - similarIds.size,
      'culture'
    )
  }

  if (artwork.classification && similarIds.size < limit) {
    await searchAndAddResults(
      artwork.classification,
      { hasImages: true },
      similarIds,
      excludeId,
      limit - similarIds.size,
      'classification'
    )
  }

  if (artwork.objectBeginDate && similarIds.size < limit) {
    const dateBegin = artwork.objectBeginDate - 50
    const dateEnd = artwork.objectEndDate ? artwork.objectEndDate + 50 : artwork.objectBeginDate + 50
    
    await searchAndAddResults(
      '',
      { hasImages: true, dateBegin, dateEnd },
      similarIds,
      excludeId,
      limit - similarIds.size,
      'date period'
    )
  }

  if (artwork.tags && artwork.tags.length > 0 && similarIds.size < limit) {
    await searchAndAddResults(
      artwork.tags[0].term,
      { hasImages: true },
      similarIds,
      excludeId,
      limit - similarIds.size,
      'tags'
    )
  }

  if (similarIds.size === 0) {
    return []
  }

  const similarArtworkIds = Array.from(similarIds).slice(0, limit)
  const similarArtworks = await batchGetArtworks(similarArtworkIds)
  
  return similarArtworks.filter(
    (artwork): artwork is ArtworkObject => artwork !== null
  )
}
