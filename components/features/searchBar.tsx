'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X, Grid, List, Filter, Clock, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search-store'
import { useSearchHistoryStore } from '@/lib/stores/search-history-store'
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
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistoryStore()
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [focusedHistoryIndex, setFocusedHistoryIndex] = useState(-1)
  
  // Refs to prevent circular updates
  const isUserInputRef = useRef(false)
  const isClearingRef = useRef(false)
  const isHistorySelectRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const historySaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentQueryRef = useRef(query)
  const lastSavedQueryRef = useRef<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const historyDropdownRef = useRef<HTMLDivElement>(null)
  
  // Keep ref in sync with query
  useEffect(() => {
    currentQueryRef.current = query
  }, [query])

  // Save to history only when search is stable
  useEffect(() => {
    // Clear any pending history save
    if (historySaveTimeoutRef.current) {
      clearTimeout(historySaveTimeoutRef.current)
      historySaveTimeoutRef.current = null
    }

    // Skip if clearing or query is empty
    if (isClearingRef.current) {
      lastSavedQueryRef.current = ''
      return
    }

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      lastSavedQueryRef.current = ''
      return
    }

    // Only save if query is different from last saved query
    if (trimmedQuery === lastSavedQueryRef.current) {
      return
    }

    // Wait 2 seconds after query stabilizes before saving to history
    // This ensures we only save when user has finished their search
    historySaveTimeoutRef.current = setTimeout(() => {
      const currentTrimmedQuery = currentQueryRef.current.trim()
      // Double-check query hasn't changed during the delay
      if (currentTrimmedQuery && currentTrimmedQuery === trimmedQuery && currentTrimmedQuery !== lastSavedQueryRef.current) {
        addToHistory(currentTrimmedQuery)
        lastSavedQueryRef.current = currentTrimmedQuery
      }
    }, 2000) // 2 seconds after debounce completes

    return () => {
      if (historySaveTimeoutRef.current) {
        clearTimeout(historySaveTimeoutRef.current)
      }
    }
  }, [query, addToHistory])

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyDropdownRef.current &&
        !historyDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsHistoryOpen(false)
        setFocusedHistoryIndex(-1)
      }
    }

    if (isHistoryOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isHistoryOpen])

  // Handle keyboard navigation in history dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHistoryOpen || history.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedHistoryIndex((prev) =>
          prev < history.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === 'Enter' && focusedHistoryIndex >= 0) {
        e.preventDefault()
        const selectedItem = history[focusedHistoryIndex]
        if (selectedItem) {
          handleHistorySelect(selectedItem.query)
        }
      } else if (e.key === 'Escape') {
        setIsHistoryOpen(false)
        setFocusedHistoryIndex(-1)
        searchInputRef.current?.focus()
      }
    }

    if (isHistoryOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isHistoryOpen, history, focusedHistoryIndex])

  // Sync from URL only on external navigation (browser back/forward, direct URL)
  // Skip when user is actively typing or clearing
  useEffect(() => {
    // Don't sync from URL if user is currently typing, clearing, or selecting from history
    if (isUserInputRef.current || isClearingRef.current || isHistorySelectRef.current) {
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
        // Close history dropdown when search is executed
        setIsHistoryOpen(false)
        setFocusedHistoryIndex(-1)
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
    lastSavedQueryRef.current = ''
    
    // Clear any pending debounces and history saves
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current)
      urlUpdateTimeoutRef.current = null
    }
    if (historySaveTimeoutRef.current) {
      clearTimeout(historySaveTimeoutRef.current)
      historySaveTimeoutRef.current = null
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

  const handleHistorySelect = useCallback((historyQuery: string) => {
    const sanitized = sanitizeSearchQuery(historyQuery)
    const result = searchQuerySchema.safeParse(sanitized)
    const validatedQuery = result.success ? result.data : ''
    
    if (validatedQuery) {
      // Set flags to prevent interference from other effects
      isUserInputRef.current = false
      isClearingRef.current = false
      isHistorySelectRef.current = true
      
      // Update refs immediately
      currentQueryRef.current = validatedQuery
      
      // Clear any pending debounces
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current)
        urlUpdateTimeoutRef.current = null
      }
      
      // Update state immediately - set query FIRST to trigger search
      setQuery(validatedQuery)
      setLocalQuery(validatedQuery)
      
      // Update URL immediately
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', sanitizeString(validatedQuery))
      const newSearch = params.toString()
      const newUrl = newSearch 
        ? `${pathname}?${newSearch}`
        : pathname
      
      router.replace(newUrl, { scroll: false })
      
      // Close history dropdown
      setIsHistoryOpen(false)
      setFocusedHistoryIndex(-1)
      searchInputRef.current?.blur()
      
      // Reset history select flag after a delay to allow URL update to complete
      setTimeout(() => {
        isHistorySelectRef.current = false
      }, 300)
    }
  }, [setQuery, searchParams, pathname, router])

  const handleRemoveHistoryItem = useCallback((e: React.MouseEvent, timestamp: number) => {
    e.stopPropagation()
    removeFromHistory(timestamp)
  }, [removeFromHistory])

  const handleClearHistory = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    clearHistory()
  }, [clearHistory])

  const handleInputFocus = useCallback(() => {
    if (history.length > 0 && !localQuery) {
      setIsHistoryOpen(true)
    }
  }, [history.length, localQuery])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value.length <= 500 ? value : localQuery)
    // Show history when input is cleared
    if (!value && history.length > 0) {
      setIsHistoryOpen(true)
    } else {
      setIsHistoryOpen(false)
      setFocusedHistoryIndex(-1)
    }
  }, [localQuery, history.length])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Save to history immediately when Enter is pressed
    if (e.key === 'Enter') {
      const trimmedQuery = localQuery.trim()
      if (trimmedQuery && trimmedQuery !== lastSavedQueryRef.current) {
        // Clear any pending history save timeout
        if (historySaveTimeoutRef.current) {
          clearTimeout(historySaveTimeoutRef.current)
          historySaveTimeoutRef.current = null
        }
        // Save immediately
        addToHistory(trimmedQuery)
        lastSavedQueryRef.current = trimmedQuery
      }
      // Close history dropdown
      setIsHistoryOpen(false)
      setFocusedHistoryIndex(-1)
      searchInputRef.current?.blur()
    }
  }, [localQuery, addToHistory])

  // Filter history based on current input
  const filteredHistory = localQuery
    ? history.filter((item) =>
        item.query.toLowerCase().includes(localQuery.toLowerCase())
      )
    : history

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
            ref={searchInputRef}
            type="search"
            placeholder="Search by title, artist, or culture..."
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            maxLength={500}
            className="pl-10 pr-10"
            aria-label="Search artworks by title, artist, or culture"
            aria-expanded={isHistoryOpen}
            aria-haspopup="listbox"
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
          
          {/* Search History Dropdown */}
          {isHistoryOpen && filteredHistory.length > 0 && (
            <div
              ref={historyDropdownRef}
              className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-80 overflow-y-auto"
              role="listbox"
            >
              <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Recent Searches</span>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="cursor-pointer h-7 px-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label="Clear all search history"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="py-1">
                {filteredHistory.map((item, index) => (
                  <button
                    key={item.timestamp}
                    type="button"
                    onClick={() => handleHistorySelect(item.query)}
                    onMouseEnter={() => setFocusedHistoryIndex(index)}
                    className={`cursor-pointer w-full px-4 py-2 text-left text-sm flex items-center justify-between group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                      focusedHistoryIndex === index
                        ? 'bg-zinc-100 dark:bg-zinc-800'
                        : ''
                    }`}
                    role="option"
                    aria-selected={focusedHistoryIndex === index}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" aria-hidden="true" />
                      <span className="truncate text-zinc-900 dark:text-zinc-100">
                        {item.query}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => handleRemoveHistoryItem(e, item.timestamp)}
                      aria-label={`Remove "${item.query}" from history`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                    </Button>
                  </button>
                ))}
              </div>
            </div>
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
