'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { ArtworkCard } from './artworkCard'
import { ArtworkCardSkeleton } from './artworkCardSkeleton'
import { EmptyState } from './emptyState'
import { ErrorState } from './errorState'
import { FeaturedArtworks } from './featuredArtworks'
import { VirtualizedArtworkList } from './virtualizedArtworkList'
import { useArtworkSearch } from '@/lib/hooks/useArtworkSearch'
import { useSearchStore } from '@/lib/stores/search-store'
import { UI_CONFIG, ERROR_MESSAGES } from '@/lib/constants/config'
import { cn } from '@/lib/utils/cn'

/**
 * Artwork grid with infinite scroll
 * Implements intersection observer for automatic pagination
 */
export function ArtworkGrid() {
  const { query, filters, viewMode } = useSearchStore()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useArtworkSearch({
    query,
    filters,
    enabled: query.trim().length > 0,
  })

  const artworks = data?.pages.flatMap(page => page.artworks) || []
  const shouldVirtualize = artworks.length >= UI_CONFIG.VIRTUALIZATION_THRESHOLD

  // Intersection Observer for infinite scroll (only for non-virtualized view)
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    // Only set up IntersectionObserver for non-virtualized view
    if (shouldVirtualize) return

    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [handleObserver, shouldVirtualize])

  // Handle view mode transition animation
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 500)
    return () => clearTimeout(timer)
  }, [viewMode])

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6 transition-all duration-500 ease-in-out",
        viewMode === 'grid'
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      )}>
        {Array.from({ length: UI_CONFIG.SKELETON_COUNT }).map((_, index) => (
          <ArtworkCardSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        message={ERROR_MESSAGES.GENERIC}
        onRetry={() => refetch()}
      />
    )
  }

  if (!query.trim()) {
    return <FeaturedArtworks />
  }

  if (artworks.length === 0) {
    return (
      <EmptyState
        type="search"
        title="No artworks found"
        description={`We couldn't find any artworks matching "${query}". Try adjusting your search terms or filters.`}
      />
    )
  }

  const renderRegularGrid = () => (
    <div className="space-y-8">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Found <span className="font-semibold">{artworks.length}</span> artwork{artworks.length !== 1 ? 's' : ''}
          {hasNextPage && ' (loading more...)'}
        </p>
      </div>

      {/* Artwork Grid */}
      <div 
        className={cn(
          "grid gap-6",
          viewMode === 'grid'
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}
        role="list"
        aria-label="Artwork results"
      >
        {artworks.map((artwork, index) => (
          <article 
            key={artwork.objectID}
            role="listitem"
            className={cn(
              "view-mode-transition",
              isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
            )}
            style={{
              transitionDelay: `${Math.min(index * 10, 200)}ms`,
            }}
          >
            <ArtworkCard artwork={artwork} viewMode={viewMode} />
          </article>
        ))}
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className={cn(
          "grid gap-6 mt-6 transition-all duration-500 ease-in-out",
          viewMode === 'grid'
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {Array.from({ length: 4 }).map((_, index) => (
            <ArtworkCardSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />

      {/* End of results indicator */}
      {!hasNextPage && artworks.length > 0 && (
        <div className="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
          You've reached the end of the results
        </div>
      )}
    </div>
  )

  if (shouldVirtualize) {
    return (
      <div className="space-y-8">
        {/* Results count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Found <span className="font-semibold">{artworks.length}</span> artwork{artworks.length !== 1 ? 's' : ''}
              {hasNextPage && ' (loading more...)'}
            </p>
            {/* Virtualization indicator badge */}
            <span 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              title={`Virtualization enabled for ${artworks.length} items (threshold: ${UI_CONFIG.VIRTUALIZATION_THRESHOLD})`}
            >
              <svg 
                className="w-3.5 h-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              Virtualized
            </span>
          </div>
        </div>

        {/* Virtualized Artwork List */}
        <VirtualizedArtworkList
          artworks={artworks}
          viewMode={viewMode}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />

        {/* End of results indicator */}
        {!hasNextPage && artworks.length > 0 && (
          <div className="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
            You've reached the end of the results
          </div>
        )}
      </div>
    )
  }

  return renderRegularGrid()
}
