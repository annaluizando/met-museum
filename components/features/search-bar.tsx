'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Grid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search-store'
import { UI_CONFIG } from '@/lib/constants/config'

/**
 * Search bar with debounce and view mode toggle
 * Implements proper keyboard navigation and ARIA labels
 */
export function SearchBar() {
  const { query, setQuery, viewMode, setViewMode } = useSearchStore()
  const [localQuery, setLocalQuery] = useState(query)

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

  return (
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
  )
}
