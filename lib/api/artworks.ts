import { fetchApi } from './client'
import type {
  ArtworkObject,
  SearchResponse,
  SearchFilters,
  DepartmentsResponse,
} from '@/lib/types/artwork'

/**
 * Search for artworks with optional filters
 * Uses smart search with fallback: tries focused search first, then broader if no results
 */
export async function searchArtworks(
  query: string,
  filters?: SearchFilters
): Promise<SearchResponse> {
  // Helper to build params
  const buildParams = (includeSearchScope: boolean) => {
    const params = new URLSearchParams()
    params.append('q', query)

    // Try focused search on title/artist first for better relevance
    if (includeSearchScope) {
      params.append('title', 'true')
      params.append('artistOrCulture', 'true')
    }

    if (filters?.departmentId) {
      params.append('departmentId', filters.departmentId.toString())
    }
    if (filters?.isHighlight !== undefined) {
      params.append('isHighlight', filters.isHighlight.toString())
    }
    if (filters?.isOnView !== undefined) {
      params.append('isOnView', filters.isOnView.toString())
    }
    if (filters?.hasImages !== undefined) {
      params.append('hasImages', filters.hasImages.toString())
    }
    if (filters?.medium) {
      params.append('medium', filters.medium)
    }
    if (filters?.geoLocation) {
      params.append('geoLocation', filters.geoLocation)
    }
    if (filters?.dateBegin !== undefined && filters?.dateEnd !== undefined) {
      params.append('dateBegin', filters.dateBegin.toString())
      params.append('dateEnd', filters.dateEnd.toString())
    }

    return params
  }

  // Try focused search first (title + artist/culture)
  try {
    const focusedParams = buildParams(true)
    const focusedResults = await fetchApi<SearchResponse>(`/search?${focusedParams.toString()}`)
    
    // If we got results, return them
    if (focusedResults.objectIDs && focusedResults.objectIDs.length > 0) {
      return focusedResults
    }
  } catch (error) {
    // If focused search fails, fall through to broad search
    console.warn('Focused search failed, falling back to broad search:', error)
  }

  // Fallback to broader search (all fields)
  const broadParams = buildParams(false)
  return fetchApi<SearchResponse>(`/search?${broadParams.toString()}`)
}

/**
 * Get artwork details by ID
 */
export async function getArtworkById(id: number): Promise<ArtworkObject> {
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
  const promises = ids.map(id =>
    getArtworkById(id).catch(() => null)
  )
  
  return Promise.all(promises)
}
