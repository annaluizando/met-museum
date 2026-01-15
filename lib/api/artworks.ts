import { fetchApi, MetApiError } from './client'
import { ERROR_MESSAGES } from '@/lib/constants/config'
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
  
  const params = new URLSearchParams()
  params.append('q', queryResult.data)
  if (validatedFilters?.departmentId) {
    params.append('departmentId', validatedFilters.departmentId.toString())
  }
  if (validatedFilters?.isHighlight !== undefined) {
    params.append('isHighlight', validatedFilters.isHighlight.toString())
  }
  if (validatedFilters?.isOnView !== undefined) {
    params.append('isOnView', validatedFilters.isOnView.toString())
  }
  if (validatedFilters?.hasImages !== undefined) {
    params.append('hasImages', validatedFilters.hasImages.toString())
  }
  if (validatedFilters?.medium) {
    params.append('medium', validatedFilters.medium)
  }
  if (validatedFilters?.geoLocation) {
    params.append('geoLocation', validatedFilters.geoLocation)
  }
  if (validatedFilters?.dateBegin !== undefined && validatedFilters?.dateEnd !== undefined) {
    params.append('dateBegin', validatedFilters.dateBegin.toString())
    params.append('dateEnd', validatedFilters.dateEnd.toString())
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
export async function findSimilarArtworks(
  artwork: ArtworkObject,
  limit: number = 12
): Promise<ArtworkObject[]> {
  const similarIds = new Set<number>()
  const excludeId = artwork.objectID

  if (artwork.artistDisplayName) {
    try {
      const artistResults = await searchArtworks(artwork.artistDisplayName, {
        hasImages: true,
      })
      if (artistResults.objectIDs) {
        artistResults.objectIDs
          .filter(id => id !== excludeId)
          .slice(0, limit)
          .forEach(id => similarIds.add(id))
      }
    } catch (error) {
      console.error('Error searching by artist:', error)
    }
  }

  if (artwork.department && artwork.culture && similarIds.size < limit) {
    try {
      const cultureResults = await searchArtworks(artwork.culture, {
        hasImages: true,
      })
      if (cultureResults.objectIDs) {
        cultureResults.objectIDs
          .filter(id => id !== excludeId && !similarIds.has(id))
          .slice(0, limit - similarIds.size)
          .forEach(id => similarIds.add(id))
      }
    } catch (error) {
      console.error('Error searching by culture:', error)
    }
  }

  if (artwork.classification && similarIds.size < limit) {
    try {
      const classificationResults = await searchArtworks(artwork.classification, {
        hasImages: true,
      })
      if (classificationResults.objectIDs) {
        classificationResults.objectIDs
          .filter(id => id !== excludeId && !similarIds.has(id))
          .slice(0, limit - similarIds.size)
          .forEach(id => similarIds.add(id))
      }
    } catch (error) {
      console.error('Error searching by classification:', error)
    }
  }

  if (artwork.objectBeginDate && similarIds.size < limit) {
    try {
      const dateBegin = artwork.objectBeginDate - 50
      const dateEnd = artwork.objectEndDate ? artwork.objectEndDate + 50 : artwork.objectBeginDate + 50
      const periodResults = await searchArtworks('', {
        hasImages: true,
        dateBegin,
        dateEnd,
      })
      if (periodResults.objectIDs) {
        periodResults.objectIDs
          .filter(id => id !== excludeId && !similarIds.has(id))
          .slice(0, limit - similarIds.size)
          .forEach(id => similarIds.add(id))
      }
    } catch (error) {
      console.error('Error searching by date period:', error)
    }
  }

  if (artwork.tags && artwork.tags.length > 0 && similarIds.size < limit) {
    try {
      const tagTerm = artwork.tags[0].term
      const tagResults = await searchArtworks(tagTerm, {
        hasImages: true,
      })
      if (tagResults.objectIDs) {
        tagResults.objectIDs
          .filter(id => id !== excludeId && !similarIds.has(id))
          .slice(0, limit - similarIds.size)
          .forEach(id => similarIds.add(id))
      }
    } catch (error) {
      console.error('Error searching by tags:', error)
    }
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
