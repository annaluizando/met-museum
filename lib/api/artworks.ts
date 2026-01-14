import { fetchApi } from './client'
import type {
  ArtworkObject,
  SearchResponse,
  SearchFilters,
  DepartmentsResponse,
} from '@/lib/types/artwork'

/**
 * Search for artworks with optional filters
 * The Met Museum API searches across all metadata fields (title, artist, culture, etc.)
 */
export async function searchArtworks(
  query: string,
  filters?: SearchFilters
): Promise<SearchResponse> {
  const params = new URLSearchParams()
  params.append('q', query)

  // Add optional filters
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

  return fetchApi<SearchResponse>(`/search?${params.toString()}`)
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
