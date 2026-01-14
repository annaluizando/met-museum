'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { ArtworkCard } from './artwork-card'
import { ArtworkCardSkeleton } from './artwork-card-skeleton'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import { FeaturedArtworks } from './featured-artworks'
import { useArtworkSearch } from '@/lib/hooks/use-artwork-search'
import { useSearchStore } from '@/lib/stores/search-store'
import { UI_CONFIG } from '@/lib/constants/config'
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
    error,
    refetch,
  } = useArtworkSearch({
    query,
    filters,
    enabled: query.trim().length > 0,
  })

  // Intersection Observer for infinite scroll
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
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [handleObserver])

  // Handle view mode transition animation
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 500)
    return () => clearTimeout(timer)
  }, [viewMode])

  // Show initial loading state
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

  // Show error state
  if (isError) {
    return (
      <ErrorState
        message={error?.message || 'Failed to load artworks. Please try again.'}
        onRetry={() => refetch()}
      />
    )
  }

  // Show featured artworks when no query
  if (!query.trim()) {
    return <FeaturedArtworks />
  }

  // Get all artworks from pages
  const artworks = data?.pages.flatMap(page => page.artworks) || []

  // Show empty results
  if (artworks.length === 0) {
    return (
      <EmptyState
        type="search"
        title="No artworks found"
        description={`We couldn't find any artworks matching "${query}". Try adjusting your search terms or filters.`}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600">
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
        <div className="text-center py-8 text-sm text-zinc-500">
          You've reached the end of the results
        </div>
      )}
    </div>
  )
}
