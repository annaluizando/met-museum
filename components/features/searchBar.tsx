'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X, Grid, List, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search-store'
import { SearchFiltersPanel } from './searchFilters'
import { UI_CONFIG } from '@/lib/constants/config'
import { searchQuerySchema } from '@/lib/validations/search'
import { sanitizeSearchQuery, sanitizeString } from '@/lib/utils/sanitize'

/**
 * Search bar with debounce, view mode toggle, and advanced filters
 * Implements proper keyboard navigation and ARIA labels
 * Optimized to minimize API requests by using proper debouncing
 */
export function SearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { query, setQuery, viewMode, setViewMode, filters } = useSearchStore()
  const [localQuery, setLocalQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlQuery = searchParams.get('q') || ''
      const sanitized = sanitizeSearchQuery(urlQuery)
      const result = searchQuerySchema.safeParse(sanitized)
      return result.success ? result.data : ''
    }
    return ''
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Refs to prevent circular updates
  const isUserInputRef = useRef(false)
  const isClearingRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentQueryRef = useRef(query)
  
  // Keep ref in sync with query
  useEffect(() => {
    currentQueryRef.current = query
  }, [query])

  // Sync from URL only on external navigation (browser back/forward, direct URL)
  // Skip when user is actively typing or clearing
  useEffect(() => {
    // Don't sync from URL if user is currently typing or clearing
    if (isUserInputRef.current || isClearingRef.current) {
      return
    }

    const urlQuery = searchParams.get('q') || ''
    const sanitized = sanitizeSearchQuery(urlQuery)
    const result = searchQuerySchema.safeParse(sanitized)
    const validatedQuery = result.success ? result.data : ''
    const trimmedStoreQuery = query.trim()

    // Only sync if URL actually differs from current state
    if (validatedQuery !== trimmedStoreQuery) {
      setLocalQuery(validatedQuery)
      setQuery(validatedQuery)
    }
  }, [searchParams, query, setQuery])

  // Debounce search query updates to reduce API requests
  // This effect only updates the store (which triggers API calls)
  // Only runs when localQuery changes (user typing), not when query changes
  useEffect(() => {
    // Skip if we're clearing (handleClear will handle everything)
    if (isClearingRef.current) {
      isClearingRef.current = false
      return
    }

    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Mark that this is user input
    isUserInputRef.current = true

    // Debounce the query update to the store
    debounceTimeoutRef.current = setTimeout(() => {
      const sanitized = sanitizeSearchQuery(localQuery)
      const result = searchQuerySchema.safeParse(sanitized)
      const validatedQuery = result.success ? result.data : ''
      
      // Only update if different from current query (using ref to avoid dependency)
      if (validatedQuery !== currentQueryRef.current.trim()) {
        setQuery(validatedQuery)
      }

      // Update URL after a short delay to batch URL updates
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current)
      }

      urlUpdateTimeoutRef.current = setTimeout(() => {
        isUserInputRef.current = false
        
        // Check current URL to avoid unnecessary updates
        const currentUrlQuery = new URLSearchParams(window.location.search).get('q') || ''
        
        // Only update URL if it actually changed
        if (validatedQuery !== currentUrlQuery.trim()) {
          const params = new URLSearchParams(searchParams.toString())
          
          if (validatedQuery) {
            params.set('q', sanitizeString(validatedQuery))
          } else {
            params.delete('q')
          }
          
          const newSearch = params.toString()
          const newUrl = newSearch 
            ? `${pathname}?${newSearch}`
            : pathname
          
          // Use router.replace with scroll: false to minimize RSC requests
          // Next.js will batch these updates more efficiently than individual calls
          router.replace(newUrl, { scroll: false })
        }
      }, 200) // Increased delay to batch URL updates and reduce RSC requests
    }, UI_CONFIG.DEBOUNCE_DELAY)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current)
      }
    }
  }, [localQuery, setQuery, searchParams, pathname, router])

  const handleClear = useCallback(() => {
    // Set flags FIRST to prevent all effects from interfering
    isClearingRef.current = true
    isUserInputRef.current = false
    
    // Update the ref immediately to prevent any race conditions
    currentQueryRef.current = ''
    
    // Clear any pending debounces
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current)
      urlUpdateTimeoutRef.current = null
    }

    // Update store and local state immediately (in this order)
    setQuery('')
    setLocalQuery('')
    
    // Update URL immediately - check if it needs to change first
    const currentUrlQuery = new URLSearchParams(window.location.search).get('q') || ''
    
    if (currentUrlQuery) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      
      const newSearch = params.toString()
      const newUrl = newSearch 
        ? `${pathname}?${newSearch}`
        : pathname
      
      router.replace(newUrl, { scroll: false })
    }
    
    // Reset clearing flag after a delay to allow URL update and all effects to settle
    // This prevents the URL sync effect from interfering with the clear operation
    setTimeout(() => {
      isClearingRef.current = false
    }, 300) // Increased delay to ensure URL update completes
  }, [setQuery, searchParams, pathname, router])

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
            onChange={(e) => {
              const value = e.target.value
              setLocalQuery(value.length <= 500 ? value : localQuery)
            }}
            maxLength={500}
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
