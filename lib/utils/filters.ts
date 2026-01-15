import type { SearchFilters, ArtworkObject } from '@/lib/types/artwork'

/**
 * Check if filters object has any active filters
 * Excludes undefined, false, empty string, and empty object
 */
export function hasActiveFilters(filters: SearchFilters | undefined): boolean {
  if (!filters) return false

  return Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters]
    
    if (value === undefined) return false
    if (value === false) return false
    if (value === '') return false
    if (typeof value === 'number' && isNaN(value)) return false
    
    return true
  })
}

/**
 * Centralized function to check if an artwork has images
 * Validates that at least one image URL exists
 */
export function artworkHasImages(artwork: ArtworkObject): boolean {
  const primaryImage = artwork.primaryImage
  const primaryImageSmall = artwork.primaryImageSmall
  
  return (
    (typeof primaryImage === 'string' && primaryImage.length > 0) ||
    (typeof primaryImageSmall === 'string' && primaryImageSmall.length > 0)
  )
}

export function filterByHasImages(
  artworks: ArtworkObject[],
  hasImages?: boolean
): ArtworkObject[] {
  if (hasImages !== true) {
    return artworks
  }
  
  return artworks.filter(artwork => artworkHasImages(artwork))
}
