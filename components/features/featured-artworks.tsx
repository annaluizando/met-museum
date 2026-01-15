'use client'

import { useEffect, useState } from 'react'
import { ArtworkCard } from './artwork-card'
import { ArtworkCardSkeleton } from './artwork-card-skeleton'
import { useFeaturedArtworks } from '@/lib/hooks/use-featured-artworks'
import { useSearchStore } from '@/lib/stores/search-store'
import { cn } from '@/lib/utils/cn'
import { Search } from 'lucide-react'

/**
 * Featured artworks component
 * Shows curated highlights from the Met Museum on landing
 * Uses React Query for efficient caching to prevent unnecessary API requests
 */
export function FeaturedArtworks() {
  const { viewMode } = useSearchStore()
  const { data: artworks = [], isLoading, isError } = useFeaturedArtworks()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle view mode transition animation
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 500)
    return () => clearTimeout(timer)
  }, [viewMode])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Featured Artworks
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Discover masterpieces from The Met Collection
          </p>
        </div>
        
        <div className={cn(
          "grid gap-6 transition-all duration-500 ease-in-out",
          viewMode === 'grid'
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {Array.from({ length: 8 }).map((_, index) => (
            <ArtworkCardSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    // Show a friendly message encouraging users to search instead of an error
    // This keeps the landing page positive and guides users to action
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
            <Search className="w-8 h-8 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Explore The Met Collection
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Discover over 470,000 artworks from The Metropolitan Museum of Art. 
            Start searching by artwork title, artist name, culture, or time period.
          </p>
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Featured Artworks
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Discover masterpieces from The Met Collection
        </p>
      </div>
      
      <div 
        className={cn(
          "grid gap-6",
          viewMode === 'grid'
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}
        role="list"
        aria-label="Featured artworks"
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

      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Start searching to explore over 470,000 artworks
        </p>
      </div>
    </div>
  )
}
