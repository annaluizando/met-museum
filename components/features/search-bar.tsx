'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Grid, List, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search-store'
import { SearchFiltersPanel } from './search-filters'
import { UI_CONFIG } from '@/lib/constants/config'

/**
 * Search bar with debounce, view mode toggle, and advanced filters
 * Implements proper keyboard navigation and ARIA labels
 */
export function SearchBar() {
  const searchParams = useSearchParams()
  const { query, setQuery, viewMode, setViewMode, filters } = useSearchStore()
  const [localQuery, setLocalQuery] = useState(query)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Read search query from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && urlQuery !== query) {
      setLocalQuery(urlQuery)
      setQuery(urlQuery)
    }
  }, [searchParams, query, setQuery])

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setQuery(localQuery)
    }, UI_CONFIG.DEBOUNCE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [localQuery, setQuery])

  const handleClear = useCallback(() => {
    setLocalQuery('')
    setQuery('')
  }, [setQuery])

  const toggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }, [viewMode, setViewMode])

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen(prev => !prev)
  }, [])

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof typeof filters]
    return value !== undefined && value !== false && value !== ''
  }).length

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" 
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by title, artist, or culture..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search artworks by title, artist, or culture"
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleFilters}
          aria-label={isFiltersOpen ? "Close filters" : "Open filters"}
          title={isFiltersOpen ? "Close filters" : "Advanced filters"}
          className="relative"
        >
          <Filter className={`w-5 h-5 transition-colors ${isFiltersOpen ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'}`} aria-hidden="true" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleViewMode}
          aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        >
          {viewMode === 'grid' ? (
            <List className="w-5 h-5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          ) : (
            <Grid className="w-5 h-5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          )}
        </Button>
      </div>

      <SearchFiltersPanel 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
      />
    </div>
  )
}
