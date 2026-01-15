import type { SearchFilters } from '@/lib/types/artwork'

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
