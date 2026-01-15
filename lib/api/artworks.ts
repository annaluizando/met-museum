import { fetchApi } from './client'
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
  // Validate and sanitize query
  const sanitizedQuery = sanitizeSearchQuery(query)
  const queryResult = searchQuerySchema.safeParse(sanitizedQuery)
  
  if (!queryResult.success) {
    throw new Error('Invalid search query')
  }
  
  let validatedFilters: SearchFilters | undefined
  if (filters) {
    const filtersResult = searchFiltersSchema.safeParse(filters)
    if (filtersResult.success) {
      validatedFilters = filtersResult.data
    } else {
      // If validation fails, use empty filters rather than throwing
      // This allows the search to proceed with just the query
      validatedFilters = undefined
    }
  }
  
  const params = new URLSearchParams()
  params.append('q', queryResult.data)

  // Add optional validated filters
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
    throw new Error('Artwork ID must be a positive integer')
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
  // Filter out invalid IDs
  const validIds = ids.filter(id => Number.isInteger(id) && id > 0)
  
  if (validIds.length === 0) {
    return []
  }
  
  const promises = validIds.map(id =>
    getArtworkById(id).catch(() => null)
  )
  
  return Promise.all(promises)
}
